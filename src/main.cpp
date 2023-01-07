#include <M5Unified.h>
#include "muted.c"
#include "unmuted.c"

bool isMuted = false;

void draw() {
    if(isMuted) M5.Lcd.drawPng(muted, muted_size, 0, 0);
    else M5.Lcd.drawPng(unmuted, unmuted_size, 0, 0);
}

void setup() {
    auto cfg = M5.config();
    M5.begin(cfg);
    USBSerial.begin(115200);
    draw();
}

void loop() {
    M5.update();
    if(M5.BtnA.wasReleased()) {
        isMuted = !isMuted;
        USBSerial.println(isMuted ? "mute" : "unmute");
        draw();
    }
    if(USBSerial.available() > 0) {
        String str = USBSerial.readStringUntil('\n');
        if(str == "mute") isMuted = true;
        else if(str == "unmute") isMuted = false;
        draw();
    }
    delay(32);
}
