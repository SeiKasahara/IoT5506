/*
Environment_Calculations.ino

This code shows how to record data from the BME280 environmental sensor
and perform various calculations.

GNU General Public License

Written: Dec 30 2015.
Last Updated: Oct 07 2017.

Connecting the BME280 Sensor:
Sensor              ->  Board
-----------------------------
Vin (Voltage In)    ->  3.3V
Gnd (Ground)        ->  Gnd
SDA (Serial Data)   ->  A4 on Uno/Pro-Mini, 20 on Mega2560/Due, 2 Leonardo/Pro-Micro
SCK (Serial Clock)  ->  A5 on Uno/Pro-Mini, 21 on Mega2560/Due, 3 Leonardo/Pro-Micro

 */

//BLINK SETUP
#define BLYNK_TEMPLATE_ID "TMPL6d9UgTgHr"
#define BLYNK_TEMPLATE_NAME "bme280"
#define BLYNK_AUTH_TOKEN "hN66YjkNT53bmLVetTBW_5TUfNeghGv-"

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>

// Your WiFi credentials.
char ssid[] = "gp";
char pass[] = "guspraaa";
//////////////////////////////


#include <EnvironmentCalculations.h>
#include <BME280I2C.h>
#include <Wire.h>

#define SERIAL_BAUD 115200

// Assumed environmental values:
// float referencePressure = 1018.6;  // hPa local QFF (official meteor-station reading)
// float outdoorTemp = 4.7;           // °C  measured local outdoor temp.
// float barometerAltitude = 1650.3;  // meters ... map readings + barometer position


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

//SETUP MQ-9 /////////////////////////////////////
#include <MQUnifiedsensor.h>
/************************Hardware Related Macros************************************/
// #define         Board                   ("Arduino UNO")
#define         Board                   ("ESP-32")
// #define         Pin                     (A9)  //Analog input 4 of your arduino
#define         Pin                     (36)
/***********************Software Related Macros************************************/
#define         Type                    ("MQ-9") //MQ9
// #define         Voltage_Resolution      (5)
#define         Voltage_Resolution      (3.3)
// #define         ADC_Bit_Resolution      (10) // For arduino UNO/MEGA/NANO
#define         ADC_Bit_Resolution      (12) // ESP-32 bit resolution. Source: https://randomnerdtutorials.com/esp32-adc-analog-read-arduino-ide/
// #define         RatioMQ9CleanAir        (9.6) //RS / R0 = 60 ppm 
#define         RatioMQ9CleanAir        (9.83) //RS / R0 = 9.83 ppm
/*****************************Globals***********************************************/
//Declare Sensor
MQUnifiedsensor MQ9(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin, Type);

//END OF SETUP MQ-9 /////////////////////////

//////////////////////////////////////////////////////////////////
void setup()
{
  Serial.begin(SERIAL_BAUD);

  while(!Serial) {} // Wait

  Wire.begin();

  while(!bme.begin())
  {
    Serial.println("Could not find BME280 sensor!");
    delay(1000);
  }

  switch(bme.chipModel())
  {
     case BME280::ChipModel_BME280:
       Serial.println("Found BME280 sensor! Success.");
       break;
     case BME280::ChipModel_BMP280:
       Serial.println("Found BMP280 sensor! No Humidity available.");
       break;
     default:
       Serial.println("Found UNKNOWN sensor! Error!");
  }
  // Serial.print("Assumed outdoor temperature: "); Serial.print(outdoorTemp);
  // Serial.print("°C\nAssumed reduced sea level Pressure: "); Serial.print(referencePressure);
  // Serial.print("hPa\nAssumed barometer altitude: "); Serial.print(barometerAltitude);
  // Serial.println("m\n***************************************");

  mq9setup();

  //BLYNK SETUP
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

}

void mq9setup(){
  //Set math model to calculate the PPM concentration and the value of constants
  MQ9.setRegressionMethod(1); //_PPM =  a*ratio^b
 
  
  /*****************************  MQ Init ********************************************/ 
  //Remarks: Configure the pin of arduino as input.
  /************************************************************************************/ 
  MQ9.init(); 
  /* 
    //If the RL value is different from 10K please assign your RL value with the following method:
    MQ9.setRL(10);
  */
  /*****************************  MQ CAlibration ********************************************/ 
  // Explanation: 
   // In this routine the sensor will measure the resistance of the sensor supposedly before being pre-heated
  // and on clean air (Calibration conditions), setting up R0 value.
  // We recomend executing this routine only on setup in laboratory conditions.
  // This routine does not need to be executed on each restart, you can load your R0 value from eeprom.
  // Acknowledgements: https://jayconsystems.com/blog/understanding-a-gas-sensor
  Serial.print("Calibrating please wait.");
  float calcR0 = 0;
  for(int i = 1; i<=10; i ++)
  {
    MQ9.update(); // Update data, the arduino will read the voltage from the analog pin
    calcR0 += MQ9.calibrate(RatioMQ9CleanAir);
    Serial.print(".");
  }
  MQ9.setR0(calcR0/10);
  Serial.println("  done!.");
  
  if(isinf(calcR0)) {Serial.println("Warning: Conection issue, R0 is infinite (Open circuit detected) please check your wiring and supply"); while(1);}
  if(calcR0 == 0){Serial.println("Warning: Conection issue found, R0 is zero (Analog pin shorts to ground) please check your wiring and supply"); while(1);}
  /*****************************  MQ CAlibration ********************************************/ 
}



//////////////////////////////////////////////////////////////////
// Variables for non-blocking timing
unsigned long previousMillis = 0;
const long interval = 5000;  // 1-second interval for data updates

void loop()
{
   
  //  printBME280Data(&Serial);
  //  delay(500);

  // Non-blocking update every second
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Send sensor data every second
    printBME280Data(&Serial);

    printMQ9Data();
  }

  Blynk.run();
}

//////////////////////////////////////////////////////////////////
// Temperature threshold
float tempThreshold = 30.0;
bool tempExceeded = false;

void printBME280Data
(
   Stream* client
)
{
   float temp(NAN), hum(NAN), pres(NAN);

   BME280::TempUnit tempUnit(BME280::TempUnit_Celsius);
  //  BME280::PresUnit presUnit(BME280::PresUnit_hPa);
  BME280::PresUnit presUnit(BME280::PresUnit_Pa);

   bme.read(pres, temp, hum, tempUnit, presUnit);

   client->print("Temp: ");
   client->print(temp);
   client->print("°"+ String(tempUnit == BME280::TempUnit_Celsius ? "C" :"F"));
   client->print("\t\tHumidity: ");
   client->print(hum);
   client->print("% RH");
   client->print("\t\tPressure: ");
   client->print(pres);
  //  client->println(String(presUnit == BME280::PresUnit_hPa ? "hPa" : "Pa")); // expected hPa and Pa only
   client->println(" Pa");

   Blynk.virtualWrite(V1, temp); 
   Blynk.virtualWrite(V2, hum); 
   Blynk.virtualWrite(V3, pres); 

   // Check if temperature exceeds threshold
  if (temp > tempThreshold && !tempExceeded) {
    // Trigger the event notification with your code
    Blynk.logEvent("temperature_too_hot_");

    // Log the notification to serial
    Serial.println("Warning: Temperature exceeded 30°C!");

    // Set flag to avoid sending repeated notifications
    tempExceeded = true;
  }

  // Reset the flag if temperature goes below threshold again
  if (temp <= tempThreshold) {
    tempExceeded = false;
  }
   
  //  EnvironmentCalculations::AltitudeUnit envAltUnit  =  EnvironmentCalculations::AltitudeUnit_Meters;
  //  EnvironmentCalculations::TempUnit     envTempUnit =  EnvironmentCalculations::TempUnit_Celsius;

  //  /// To get correct local altitude/height (QNE) the reference Pressure
  //  ///    should be taken from meteorologic messages (QNH or QFF)
  //  float altitude = EnvironmentCalculations::Altitude(pres, envAltUnit, referencePressure, outdoorTemp, envTempUnit);

  //  float dewPoint = EnvironmentCalculations::DewPoint(temp, hum, envTempUnit);

  //  /// To get correct seaLevel pressure (QNH, QFF)
  //  ///    the altitude value should be independent on measured pressure.
  //  /// It is necessary to use fixed altitude point e.g. the altitude of barometer read in a map
  //  float seaLevel = EnvironmentCalculations::EquivalentSeaLevelPressure(barometerAltitude, temp, pres, envAltUnit, envTempUnit);

  //  float absHum = EnvironmentCalculations::AbsoluteHumidity(temp, hum, envTempUnit);

  //  client->print("\t\tAltitude: ");
  //  client->print(altitude);
  //  client->print((envAltUnit == EnvironmentCalculations::AltitudeUnit_Meters ? "m" : "ft"));
  //  client->print("\t\tDew point: ");
  //  client->print(dewPoint);
  //  client->print("°"+ String(envTempUnit == EnvironmentCalculations::TempUnit_Celsius ? "C" :"F"));
  //  client->print("\t\tEquivalent Sea Level Pressure: ");
  //  client->print(seaLevel);
  //  client->print(String( presUnit == BME280::PresUnit_hPa ? "hPa" :"Pa")); // expected hPa and Pa only

  //  client->print("\t\tHeat Index: ");
  //  float heatIndex = EnvironmentCalculations::HeatIndex(temp, hum, envTempUnit);
  //  client->print(heatIndex);
  //  client->print("°"+ String(envTempUnit == EnvironmentCalculations::TempUnit_Celsius ? "C" :"F"));

  //  client->print("\t\tAbsolute Humidity: ");
  //  client->println(absHum);
  return;
}

void printMQ9Data(){
  MQ9.update(); // Update data, the arduino will read the voltage from the analog pin
  /*
  Exponential regression:
  GAS     | a      | b
  LPG     | 1000.5 | -2.186
  CH4     | 4269.6 | -2.648
  CO      | 599.65 | -2.244
  */

  MQ9.setA(1000.5); MQ9.setB(-2.186); // Configure the equation to to calculate LPG concentration
  float LPG = MQ9.readSensor(); // Sensor will read PPM concentration using the model, a and b values set previously or from the setup

  MQ9.setA(4269.6); MQ9.setB(-2.648); // Configure the equation to to calculate LPG concentration
  float CH4 = MQ9.readSensor(); // Sensor will read PPM concentration using the model, a and b values set previously or from the setup

  MQ9.setA(599.65); MQ9.setB(-2.244); // Configure the equation to to calculate LPG concentration
  float CO = MQ9.readSensor(); // Sensor will read PPM concentration using the model, a and b values set previously or from the setup

  // Serial.print("|    "); Serial.print(LPG);
  // Serial.print("    |    "); Serial.print(CH4);
  // Serial.print("    |    "); Serial.print(CO); 
  // Serial.println("    |");

  Serial.print("LPG: "); Serial.print(LPG);
  Serial.print("    CH4: "); Serial.print(CH4);
  Serial.print("    CO: "); Serial.println(CO); 

  Blynk.virtualWrite(V4, CH4);
  // delay(500); //Sampling frequency
  return;

}
