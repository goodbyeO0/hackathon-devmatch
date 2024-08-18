#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <SPI.h>
#include <MFRC522.h>
#define RST_PIN 22 // Configurable, see typical pin layout above
#define SS_PIN 21  // Configurable, see typical pin layout above
#define LED_PIN 4  // Define LED pin
// hotspot: 192.168.213.208

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance


const char *ssid = "afik uitm";
const char *password = "afikjasin";

AsyncWebServer server(80);
char data[50]; // Use char array instead of String
int nftID;
bool isNFT = false;
String walletAddress;

void setup()
{

    pinMode(13, OUTPUT);
    pinMode(LED_PIN, OUTPUT); // Initialize the LED pin as an output

    digitalWrite(LED_PIN, HIGH); // Ensure LED is off initially

    Serial.begin(9600);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    server.begin();
    SPI.begin();        // Init SPI bus
    mfrc522.PCD_Init(); // Init MFRC522
    Serial.println("Approximate your card to the reader...");
    Serial.println();
}

void loop()
{
    String uidStr = "";

    if (!mfrc522.PICC_IsNewCardPresent())
    {
        return;
    }

    if (!mfrc522.PICC_ReadCardSerial())
    {
        return;
    }

    for (byte i = 0; i < mfrc522.uid.size; i++)
    {
        uidStr += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "") + String(mfrc522.uid.uidByte[i], HEX);
    }

    if (uidStr == "b1224024") {
    nftID = 12;
    isNFT = true;
} else if (uidStr == "02771a8f95a000") {
    nftID = 13;
    isNFT = true;
} else if (uidStr == "058e764d") {
    nftID = 14;
    isNFT = true;
} else if (uidStr == "025a00adc5e000") {
    walletAddress = "0x12e442b53CA7A10D5038635bfCe8AA56498A47ED";
    isNFT = false;
}

    Serial.print("Card UID: ");
    Serial.println(uidStr);
    Serial.print("NFT ID: ");
    Serial.println(nftID);

        if (WiFi.status() == WL_CONNECTED)
        {
            if (isNFT) {
                digitalWrite(LED_PIN, LOW);
                HTTPClient httpPost;
                DynamicJsonDocument doc(1024);
                String requestBody;
                int httpCodePost;

                // Send POST request for UID
                httpPost.begin("http://192.168.213.208:3001/postNFT");
                httpPost.addHeader("Content-Type", "application/json");

                doc.clear(); // Clear previous data
                doc["nftID"] = nftID;
                serializeJson(doc, requestBody);
                Serial.println("Sending nftID to server...");
                Serial.print("nftID: ");
                Serial.println(nftID);
                Serial.println(requestBody); // Print the request body to debug

                httpCodePost = httpPost.POST(requestBody); // Send the POST request
                Serial.print("Status code for nftID POST: ");
                Serial.println(httpCodePost); // Print the status code to debug

                if (httpCodePost > 0)
                {
                    String payloadPost = httpPost.getString();
                    Serial.println(payloadPost);
                }
                else
                {
                    Serial.print("POST request for UID failed with status code ");
                    Serial.println(httpCodePost);
                }

                httpPost.end();
            } else {
                digitalWrite(LED_PIN, LOW);
                HTTPClient httpPost;
                DynamicJsonDocument doc(1024);
                String requestBody;
                int httpCodePost;

                httpPost.begin("http://192.168.213.208:3001/postWallet");
                httpPost.addHeader("Content-Type", "application/json");

                doc.clear(); // Clear previous data
                doc["walletAddress"] = walletAddress;
                serializeJson(doc, requestBody);
                Serial.println("Sending wallet to server...");
                Serial.print("walletAddress: ");
                Serial.println(walletAddress);
                Serial.println(requestBody);

                httpCodePost = httpPost.POST(requestBody); // Send the POST request
                Serial.print("Status code for wallet POST: ");
                Serial.println(httpCodePost); // Print the status code to debug

                if (httpCodePost > 0)
                {
                    String payloadPost = httpPost.getString();
                    Serial.println(payloadPost);
                }
                else
                {
                    Serial.print("POST request for UID failed with status code ");
                    Serial.println(httpCodePost);
                }

                httpPost.end();
            } 

        }
            
    delay(3000); // Delay for a moment before the next loop iteration
    digitalWrite(LED_PIN, HIGH);
}