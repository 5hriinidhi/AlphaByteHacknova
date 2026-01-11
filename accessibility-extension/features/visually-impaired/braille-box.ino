// Single-Cell Braille Box - Arduino Code
// Receives 6-bit patterns via Serial and actuates 6 servos/solenoids

// Pin definitions for 6 dots (adjust based on your hardware)
const int PIN_DOT_1 = 2;  // Top-left
const int PIN_DOT_2 = 3;  // Middle-left
const int PIN_DOT_3 = 4;  // Bottom-left
const int PIN_DOT_4 = 5;  // Top-right
const int PIN_DOT_5 = 6;  // Middle-right
const int PIN_DOT_6 = 7;  // Bottom-right

const int dotPins[] = {PIN_DOT_1, PIN_DOT_2, PIN_DOT_3, PIN_DOT_4, PIN_DOT_5, PIN_DOT_6};

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);
  
  // Set all dot pins as outputs
  for (int i = 0; i < 6; i++) {
    pinMode(dotPins[i], OUTPUT);
    digitalWrite(dotPins[i], LOW); // All pins down initially
  }
  
  Serial.println("Braille Box Ready!");
  
  // Test pattern - show all dots briefly
  testAllDots();
}

void loop() {
  // Check if data is available from serial port
  if (Serial.available() > 0) {
    // Read the incoming pattern (6 characters: "100110")
    String pattern = Serial.readStringUntil('\n');
    pattern.trim();
    
    if (pattern.length() == 6) {
      // Set each dot based on the pattern
      for (int i = 0; i < 6; i++) {
        if (pattern.charAt(i) == '1') {
          digitalWrite(dotPins[i], HIGH); // Raise pin
        } else {
          digitalWrite(dotPins[i], LOW);  // Lower pin
        }
      }
      
      // Debug: Echo back what we received
      Serial.print("Set pattern: ");
      Serial.println(pattern);
    }
  }
}

void testAllDots() {
  // Raise all dots
  for (int i = 0; i < 6; i++) {
    digitalWrite(dotPins[i], HIGH);
  }
  delay(1000);
  
  // Lower all dots
  for (int i = 0; i < 6; i++) {
    digitalWrite(dotPins[i], LOW);
  }
  delay(500);
}
