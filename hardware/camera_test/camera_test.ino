#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "time.h"

//LED SETUP
int led0 = D0;
int led1 = D1;

//SD CARD SETUP
#include "FS.h"
#include "SD.h"
#include "SPI.h"
int imageCount = 1;                // File Counter
// bool camera_sign = false;          // Check camera status
bool sd_sign = true;              // Check sd status
bool save_to_sdcard = true; //true: save image to sdcard

// Wi-Fi credentials
const char* ssid = "Touhou";
const char* password = "1154Q/g0";

// Server URL
const char* serverName = "http://192.168.137.1:8000/backend/iot/upload_image/";

#define CAMERA_MODEL_XIAO_ESP32S3 // Has PSRAM
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     40
#define SIOC_GPIO_NUM     39
#define Y9_GPIO_NUM	48
#define Y8_GPIO_NUM	11
#define Y7_GPIO_NUM	12
#define Y6_GPIO_NUM	14
#define Y5_GPIO_NUM	16
#define Y4_GPIO_NUM	18
#define Y3_GPIO_NUM	17
#define Y2_GPIO_NUM	15
#define VSYNC_GPIO_NUM 38
#define HREF_GPIO_NUM     47
#define PCLK_GPIO_NUM     13
#define LED_GPIO_NUM	21

/* Constant defines -------------------------------------------------------- */
#define EI_CAMERA_RAW_FRAME_BUFFER_COLS           320
#define EI_CAMERA_RAW_FRAME_BUFFER_ROWS           240
#define EI_CAMERA_FRAME_BYTE_SIZE                 3
#define EI_CLASSIFIER_INPUT_WIDTH                 480
#define EI_CLASSIFIER_INPUT_HEIGHT                480

/* Private variables ------------------------------------------------------- */
static bool debug_nn = false; // Set this to true to see e.g. features generated from the raw signal
static bool is_initialised = false;
uint8_t *snapshot_buf; //points to the output of the capture


static camera_config_t camera_config = {
    .pin_pwdn = PWDN_GPIO_NUM,
    .pin_reset = RESET_GPIO_NUM,
    .pin_xclk = XCLK_GPIO_NUM,
    .pin_sscb_sda = SIOD_GPIO_NUM,
    .pin_sscb_scl = SIOC_GPIO_NUM,

    .pin_d7 = Y9_GPIO_NUM,
    .pin_d6 = Y8_GPIO_NUM,
    .pin_d5 = Y7_GPIO_NUM,
    .pin_d4 = Y6_GPIO_NUM,
    .pin_d3 = Y5_GPIO_NUM,
    .pin_d2 = Y4_GPIO_NUM,
    .pin_d1 = Y3_GPIO_NUM,
    .pin_d0 = Y2_GPIO_NUM,
    .pin_vsync = VSYNC_GPIO_NUM,
    .pin_href = HREF_GPIO_NUM,
    .pin_pclk = PCLK_GPIO_NUM,

    .xclk_freq_hz = 20000000,
    .ledc_timer = LEDC_TIMER_0,
    .ledc_channel = LEDC_CHANNEL_0,

    .pixel_format = PIXFORMAT_JPEG, 
    .frame_size = FRAMESIZE_QVGA,  

    .jpeg_quality = 12, //0-63 lower number means higher quality
    .fb_count = 1,       //if more than one, i2s runs in continuous mode. Use only with JPEG
    .fb_location = CAMERA_FB_IN_PSRAM,
    .grab_mode = CAMERA_GRAB_WHEN_EMPTY,
};

/* Function definitions ------------------------------------------------------- */
bool ei_camera_init(void);
void ei_camera_deinit(void);
bool ei_camera_capture(uint32_t img_width, uint32_t img_height, uint8_t *out_buf) ;


/**
 * @brief   Setup image sensor & start streaming
 *
 * @retval  false if initialisation failed
 */
bool ei_camera_init(void) {

    if (is_initialised) return true;

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
#endif

    //initialize the camera
    esp_err_t err = esp_camera_init(&camera_config);
    if (err != ESP_OK) {
      Serial.printf("Camera init failed with error 0x%x\n", err);
      return false;
    }

    sensor_t * s = esp_camera_sensor_get();
    // initial sensors are flipped vertically and colors are a bit saturated
    if (s->id.PID == OV3660_PID) {
      s->set_vflip(s, 1); // flip it back
      s->set_brightness(s, 1); // up the brightness just a bit
      s->set_saturation(s, 0); // lower the saturation
    }

#if defined(CAMERA_MODEL_M5STACK_WIDE)
    s->set_vflip(s, 1);
    s->set_hmirror(s, 1);
#elif defined(CAMERA_MODEL_ESP_EYE)
    s->set_vflip(s, 1);
    s->set_hmirror(s, 1);
    s->set_awb_gain(s, 1);
#endif

    is_initialised = true;
    return true;
}

/**
 * @brief      Stop streaming of sensor data
 */
void ei_camera_deinit(void) {

    //deinitialize the camera
    esp_err_t err = esp_camera_deinit();

    if (err != ESP_OK)
    {
        Serial.printf("Camera deinit failed\n");
        return;
    }

    is_initialised = false;
    return;
}

/**
 * @brief      Capture, rescale and crop image
 *
 * @param[in]  img_width     width of output image
 * @param[in]  img_height    height of output image
 * @param[in]  out_buf       pointer to store output image, NULL may be used
 *                           if ei_camera_frame_buffer is to be used for capture and resize/cropping.
 *
 * @retval     false if not initialised, image captured, rescaled or cropped failed
 *
 */
bool ei_camera_capture(uint32_t img_width, uint32_t img_height, uint8_t *out_buf) {
    bool do_resize = false;

    if (!is_initialised) {
        Serial.printf("ERR: Camera is not initialized\r\n");
        return false;
    }

    camera_fb_t *fb = esp_camera_fb_get();

    if (!fb) {
        Serial.printf("Camera capture failed\n");
        return false;
    }

    //if save_to_sdcard true, then save the image to sdcard
    if(save_to_sdcard){
      char filename[32];
      sprintf(filename, "/image%d.jpg", imageCount);imageCount++;
      photo_save(filename, fb);
    }
    

   bool converted = fmt2rgb888(fb->buf, fb->len, PIXFORMAT_JPEG, snapshot_buf);

   esp_camera_fb_return(fb);

   if(!converted){
       Serial.printf("Conversion failed\n");
       return false;
   }

    if ((img_width != EI_CAMERA_RAW_FRAME_BUFFER_COLS)
        || (img_height != EI_CAMERA_RAW_FRAME_BUFFER_ROWS)) {
        do_resize = true;
    }

    return true;
}

static int ei_camera_get_data(size_t offset, size_t length, float *out_ptr)
{
    // we already have a RGB888 buffer, so recalculate offset into pixel index
    size_t pixel_ix = offset * 3;
    size_t pixels_left = length;
    size_t out_ptr_ix = 0;

    while (pixels_left != 0) {
        // Swap BGR to RGB here
        // due to https://github.com/espressif/esp32-camera/issues/379
        out_ptr[out_ptr_ix] = (snapshot_buf[pixel_ix + 2] << 16) + (snapshot_buf[pixel_ix + 1] << 8) + snapshot_buf[pixel_ix];

        // go to the next pixel
        out_ptr_ix++;
        pixel_ix+=3;
        pixels_left--;
    }
    // and done!
    return 0;
}

// Save pictures to SD card
void photo_save(const char * fileName, camera_fb_t *fb) {
  // Take a photo
  // camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Failed to get camera frame buffer");
    return;
  }
  // Save photo to file
  writeFile(SD, fileName, fb->buf, fb->len);
  
  // Release image buffer
  esp_camera_fb_return(fb);

  Serial.printf("Photo saved to file: %s\n", fileName); 
}

// SD card write file
void writeFile(fs::FS &fs, const char * path, uint8_t * data, size_t len){
    Serial.printf("Writing file: %s\n", path);

    File file = fs.open(path, FILE_WRITE);
    if(!file){
        Serial.println("Failed to open file for writing");
        return;
    }
    if(file.write(data, len) == len){
        Serial.println("File written");
    } else {
        Serial.println("Write failed");
    }
    file.close();
}

void turnOnLed(){
  digitalWrite(led0, HIGH);  
  digitalWrite(led1, HIGH); 
}

void turnOffLed(){
  digitalWrite(led0, LOW);  
  digitalWrite(led1, LOW); 
}

// Function to get the current timestamp
String getCurrentTimestamp() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("Failed to obtain time");
        return "";
    }
    char timestamp[30];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(timestamp);
}

void sendPhoto() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        
        // Get the current timestamp
        String timestamp = getCurrentTimestamp();
        
        // Append the timestamp as a parameter in the URL
        String serverPath = String(serverName) + "?timestamp=" + timestamp;
        http.begin(serverPath);
        http.addHeader("Content-Type", "image/jpeg");

        // Read the latest image file
        char filename[32];
        sprintf(filename, "/image%d.jpg", imageCount - 1); // Get the last saved image
        Serial.printf("Opening file: %s\n", filename); // Debug print

        File file = SD.open(filename);
        if (!file) {
            Serial.println("Failed to open file for reading");
            return;
        }

        // Read file content into buffer
        size_t fileSize = file.size();
        uint8_t *fileBuffer = (uint8_t *)malloc(fileSize);
        if (fileBuffer == nullptr) {
            Serial.println("Failed to allocate memory for file buffer");
            file.close();
            return;
        }

        file.read(fileBuffer, fileSize);
        file.close();

        Serial.println("Sending photo...");
        int httpResponseCode = http.POST(fileBuffer, fileSize);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println(httpResponseCode);
            Serial.println(response);
        } else {
            Serial.print("Error on sending POST: ");
            Serial.println(httpResponseCode);
        }

        http.end();
        free(fileBuffer);
    } else {
        Serial.println("WiFi not connected");
    }
}

void setup() {
    //LED SETUP
    // Initialize the LED pin as an output
    pinMode(led0, OUTPUT);
    pinMode(led1, OUTPUT);

    Serial.begin(115200);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");
    // Initialize time
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    // Camera init
    if (ei_camera_init() == false) {
        Serial.printf("Failed to initialize Camera!\r\n");
        delay(5000);
    }
    else {
        Serial.printf("Camera initialized\r\n");
    }

    // Initialize SD card
    if(!SD.begin(21)){
      Serial.println("Card Mount Failed");
      delay(5000);
      return;
    }
    uint8_t cardType = SD.cardType();

    // Determine if the type of SD card is available
    if(cardType == CARD_NONE){
      Serial.println("No SD card attached");
      delay(5000);
      return;
    }

    Serial.print("SD Card Type: ");
    if(cardType == CARD_MMC){
      Serial.println("MMC");
    } else if(cardType == CARD_SD){
      Serial.println("SDSC");
    } else if(cardType == CARD_SDHC){
      Serial.println("SDHC");
    } else {
      Serial.println("UNKNOWN");
    }
    sd_sign = true; // sd initialization check passes

    Serial.printf("\nStarting continious inference in 2 seconds...\n");
    delay(2000);
}

void loop() {
    // Turn the LED on
    turnOnLed();

    snapshot_buf = (uint8_t*)malloc(EI_CAMERA_RAW_FRAME_BUFFER_COLS * EI_CAMERA_RAW_FRAME_BUFFER_ROWS * EI_CAMERA_FRAME_BYTE_SIZE);

    // check if allocation was successful
    if(snapshot_buf == nullptr) {
        Serial.printf("ERR: Failed to allocate snapshot buffer!\n");
        return;
    }

    if (ei_camera_capture((size_t)EI_CLASSIFIER_INPUT_WIDTH, (size_t)EI_CLASSIFIER_INPUT_HEIGHT, snapshot_buf) == false) {
        Serial.printf("Failed to capture image\r\n");
        free(snapshot_buf);
        return;
    }

    turnOffLed();

    sendPhoto();
    free(snapshot_buf);
    delay(60000);
}