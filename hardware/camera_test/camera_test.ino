#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"

// Wi-Fi credentials
const char* ssid = "Touhou";
const char* password = "1154Q/g0";

// Server URL
const char* serverName = "http://192.168.137.1:8000/backend/iot/upload_image/";

// Camera configuration
#define CAMERA_MODEL_XIAO_ESP32S3
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     40
#define SIOC_GPIO_NUM     39
#define Y9_GPIO_NUM       48
#define Y8_GPIO_NUM       11
#define Y7_GPIO_NUM       12
#define Y6_GPIO_NUM       14
#define Y5_GPIO_NUM       16
#define Y4_GPIO_NUM       18
#define Y3_GPIO_NUM       17
#define Y2_GPIO_NUM       15
#define VSYNC_GPIO_NUM    38
#define HREF_GPIO_NUM     47
#define PCLK_GPIO_NUM     13

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_QQVGA; // 更低的分辨率
    config.jpeg_quality = 10; // 更高的质量值
    config.fb_count = 1;
    config.fb_location = CAMERA_FB_IN_DRAM; // 使用DRAM

    // Camera init
    if (esp_camera_init(&config) != ESP_OK) {
        Serial.println("Camera init failed");
        delay(5000); // 增加延迟
        return;
    } else {
        Serial.println("Camera init successful");
    }
}

void sendPhoto() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "image/jpeg");
        http.addHeader("file", "image");
        camera_fb_t * fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("Camera capture failed");
            return;
        }
        Serial.println("Sending photo...");
        int httpResponseCode = http.POST(fb->buf, fb->len);
          if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println(httpResponseCode);
            Serial.println(response);
          } else {
            Serial.print("Error on sending POST: ");
            Serial.println(httpResponseCode);
          }
        http.end();
        esp_camera_fb_return(fb);
    }
}

void loop() {
    sendPhoto();
    delay(60000);
