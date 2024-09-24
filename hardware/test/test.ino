#include <WiFi.h>
#include <HTTPClient.h>
#include <EnvironmentCalculations.h>
#include <BME280I2C.h>
#include <Wire.h>

#define SERVER_IP "192.168.137.1"
#define SERVER_PORT "8000"
#define SERVER_PATH "/backend/iot/sensor_data/"

#define SSID "Touhou"
#define PW "1154Q/g0"

#define MQ9B_PIN 34  // MQ-9B

const char* ssid = SSID;
const char* password = PW;
const char* serverName = "http://" SERVER_IP ":" SERVER_PORT SERVER_PATH;

BME280I2C::Settings settings(
   BME280::OSR_X1,
   BME280::OSR_X1,
   BME280::OSR_X1,
   BME280::Mode_Forced,
   BME280::StandbyTime_1000ms,
   BME280::Filter_16,
   BME280::SpiEnable_False,
   BME280I2C::I2CAddr_0x76
);

BME280I2C bme(settings);
float referencePressure = 1018.6;  // hPa
float outdoorTemp = 4.7;           // °C
float barometerAltitude = 1650.3;  // meters

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  // Connect to WiFi
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Initialize BME280 sensor
  Wire.begin();
  while(!bme.begin()) {
    Serial.println("Could not find BME280 sensor!");
    delay(1000);
  }
  if (bme.chipModel() == BME280::ChipModel_BME280) {
    Serial.println("Found BME280 sensor! Success.");
  }

  // Initialize MQ-9B sensor
  pinMode(MQ9B_PIN, INPUT);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Read BME280 sensor data
    float temp(NAN), hum(NAN), pres(NAN);
    BME280::TempUnit tempUnit(BME280::TempUnit_Celsius);
    BME280::PresUnit presUnit(BME280::PresUnit_hPa);
    bme.read(pres, temp, hum, tempUnit, presUnit);

    // Calculate additional values
    float altitude = EnvironmentCalculations::Altitude(pres, EnvironmentCalculations::AltitudeUnit_Meters, referencePressure, outdoorTemp, EnvironmentCalculations::TempUnit_Celsius);
    float dewPoint = EnvironmentCalculations::DewPoint(temp, hum, EnvironmentCalculations::TempUnit_Celsius);
    float seaLevel = EnvironmentCalculations::EquivalentSeaLevelPressure(barometerAltitude, temp, pres, EnvironmentCalculations::AltitudeUnit_Meters, EnvironmentCalculations::TempUnit_Celsius);
    float absHum = EnvironmentCalculations::AbsoluteHumidity(temp, hum, EnvironmentCalculations::TempUnit_Celsius);

    // Read MQ-9B sensor data (gas concentration)
    int mq9b_value = analogRead(MQ9B_PIN);
    float sensor_gas = (float)mq9b_value ;
    // Prepare JSON payload
    String devicename = "Device1";
    String jsonPayload = "{\"devicename\":\"" + devicename + "\",\"sensor_temperature\":" + String(temp) + ",\"sensor_humidity\":" + String(hum) + ",\"sensor_gas\":" + String(sensor_gas) + "}";

    // Send HTTP POST request
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on HTTP request");
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  delay(10000); // Send data every 10 seconds
}
