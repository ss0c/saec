#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <time.h>
#include <ACS712.h>

byte hours;
byte minutes;
byte minutes_ant;

// Replace with your network credentials
const char* ssid = "Fibertel WiFi327 2.4GHz";
const char* password = "01430017239";
const char* ntpServer  = "pool.ntp.org";
const long gmtOffset_sec = -14400;
const int dayLightOffset_sec = 3600;

bool rdySend = false;
bool rdySend2 = false;
bool ledState2 = 0;
volatile bool ledState = 0;
//
volatile const int ledPin = 2;
const int ledPin2 = 4;
const int s1Pin = 13;
const int s2Pin = 12;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

TaskHandle_t Task1;

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    if (strcmp((char*)data, "toggle_on") == 0) {
      ledState = 1;
      Serial.print(WS_TEXT);
      ws.textAll("led1_on"); // Enviar estado del LED 1
    }
    else if (strcmp((char*)data, "toggle_off") == 0) {
      ledState = 0;
      ws.textAll("led1_off"); // Enviar estado del LED 2
    }
    else if (strcmp((char*)data, "toggle1") == 0) {
      ledState2 = !ledState2;
      ws.textAll(String(ledState2 ? "2" : "3")); // Enviar estado del LED 2
    }
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}


void compareTime(byte hour_start, byte minute_start, byte hour_end, byte minute_end){
  struct tm timeinfo;

  if(!getLocalTime(&timeinfo)){
    return;
  }
  hours = timeinfo.tm_hour;
  minutes = timeinfo.tm_min;



  if(minutes != minutes_ant){ 
    ws.textAll("h"+String(hours) + ":" + String(minutes));
    minutes_ant = minutes;
  }

  

  if((hours >= hour_start and minutes >= minute_start) and (hours <= hour_end and minutes <= minute_end)){
    ledState = 0;
    digitalWrite(ledPin, LOW);
    ws.textAll(String(ledState ? "4" : "5"));
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}

String processor(const String& var){
  Serial.println(var);
  if(var == "STATE"){
    if (ledState){
      return "ON";
    }
    else{
      return "OFF";
    }
  }
  return String();
}



void mov_falling(){
  ledState = 0;
  digitalWrite(ledPin, ledState);
  rdySend = true;
}

void mov_fallings2(){
  ledState2 = 0;
  digitalWrite(ledPin2, ledState2);
  rdySend2 = true;
}

ACS712 sensor(ACS712_30A, 36);

void loop1(void *parameter){
  attachInterrupt(digitalPinToInterrupt(s1Pin), mov_falling ,FALLING);
  attachInterrupt(digitalPinToInterrupt(s2Pin), mov_fallings2 ,FALLING);
  sensor.calibrate();
  
  for(;;){

    vTaskDelay(10);
  }
}

void setup(){
  Serial.begin(115200);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(ledPin2, OUTPUT);
  digitalWrite(ledPin2, LOW);
  pinMode(s1Pin, INPUT);
  pinMode(s2Pin, INPUT);
  pinMode(36, INPUT);

  


  xTaskCreatePinnedToCore(
    loop1,    //Funcion que ejecuta la Tarea
    "Sensor", //Nombre de la Tarea
    2000,     //Numero de pilas de la tarea
    NULL,     //Parametro que se la pasan a la Tarea
    1,        //Prioridad de la tarea
    &Task1,   
    0);       //Core que se usa (normalmente se usa el 1 en el loop normal)
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  if(!SPIFFS.begin(true)){
    Serial.println("Ocurrio un error inicializando SPIFFS");
  }
  Serial.println("SPIFFS OK");
  configTime(gmtOffset_sec,dayLightOffset_sec,ntpServer);

  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());

  initWebSocket();

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html",String(), false ,processor);
  });

  server.on("/websocket.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/websocket.js", "text/javascript");
  });

  // Start server
  server.begin();
}



void loop() {
  ws.cleanupClients();
  digitalWrite(ledPin, ledState);
  digitalWrite(ledPin2, ledState2);

  compareTime(20,20,20,27);


  if(rdySend == true){
    ws.textAll("led1_off");
    rdySend = false;
  }

  else if(rdySend2 == true){
    ws.textAll(String(ledState2 ? "2" : "3"));
    rdySend2 = false;
  }
}