#include <WiFi.h>
#include <FirebaseESP32.h>

// WiFi credentials
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

// Firebase credentials
#define API_KEY ""
#define DATABASE_URL ""

// Firebase and hardware objects
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

const int sensorPin = 34;
const int RELAY_PIN = 12;

bool pumpOn = false;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);  // OFF initially (assuming active LOW relay)

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase signUp succeeded");
  } else {
    Serial.printf("Firebase signUp failed: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  int sensorValue = analogRead(sensorPin);
  int moisturePercent = map(sensorValue, 4095, 1795, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  Serial.print("Raw: ");
  Serial.print(sensorValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");

  // Save to Firebase
  Firebase.setInt(firebaseData, "/sensor/raw_value", sensorValue);
  Firebase.setInt(firebaseData, "/sensor/moisture_percent", moisturePercent);

  // Relay logic: auto control based on moisture
  if (moisturePercent < 50) {
    digitalWrite(RELAY_PIN, LOW); // ON
    Firebase.setString(firebaseData, "/sensor/relay_status", "ON");
    pumpOn = true;
  } else {
    digitalWrite(RELAY_PIN, HIGH); // OFF
    Firebase.setString(firebaseData, "/sensor/relay_status", "OFF");
    pumpOn = false;
  }

  delay(1000); // 1 second delay between readings
}
