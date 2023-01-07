import RPC from "discord-rpc";
import * as dotenv from 'dotenv';
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

const client = new RPC.Client({ transport: "ipc" }); // to Discord

dotenv.config()

// Serial Port
var serial = new SerialPort({
    path: process.env.SERIAL_PORT || '/dev/tty.usbmodem101',
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
});
const parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }))

parser.on('data', async function (input) {
    console.log(input);
    if (input.startsWith("mute") || input.startsWith("unmute")) {
        await client.setVoiceSettings({
            mute: input.startsWith("mute"),
        });
    }
});

(async () => {
    const port = process.env.PORT;
    await client.login({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        scopes: ["rpc", "rpc.voice.write", "rpc.voice.read"],
        redirectUri: `http://localhost:${port}`,
    });
    client.subscribe("VOICE_SETTINGS_UPDATE");
    client.on("VOICE_SETTINGS_UPDATE", async ({mute}) => {
        serial.write(mute ? "mute\n": "unmute\n");
    });
})();