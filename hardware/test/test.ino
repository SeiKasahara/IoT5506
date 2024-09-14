#include <WiFi.h>
#include <HTTPClient.h>

#define SERVER_IP "192.168.1.108"
#define SERVER_PORT "8000"
#define SERVER_PATH "/backend/iot/sensor_data/"

const char* ssid = "SSID";
const char* password = "PW";
const char* serverName = "http://" SERVER_IP ":" SERVER_PORT SERVER_PATH;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Replace these with your actual sensor values
    String devicename = "Device1";
    float sensor_humidity = 45.5;
    float sensor_temperature = 22.3;
    float sensor_gas = 0.98;

    String jsonPayload = "{\"devicename\":\"" + devicename + "\",\"sensor_humidity\":" + String(sensor_humidity) + ",\"sensor_temperature\":" + String(sensor_temperature) + ",\"sensor_gas\":" + String(sensor_gas) + "}";

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
