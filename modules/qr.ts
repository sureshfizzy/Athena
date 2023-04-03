import inputSanitization from "../sidekick/input-sanitization.js";
import Strings from "../lib/db.js";
import { Encoder, QRByte, ErrorCorrectionLevel } from "@nuintun/qrcode";
import fs from "fs";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { proto } from "@adiwajshing/baileys";
const QR = Strings.qr;

export default  {
    name: "qr",
    description: QR.DESCRIPTION,
    extendedDescription: QR.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".qr Hey, I am Athena." },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (args.length === 0 && !Athena.isTextReply) {
                await client
                    .sendMessage(Athena.chatId, QR.INVALID_INPUT, MessageType.text)
                    .catch((err) => inputSanitization.handleError(err, client, Athena));
                return;
            }

            let message: string;
            if (!Athena.isTextReply) {
                message = args.join(" ");
            } else {
                message = Athena.replyMessage;
            }

            const qrcode: Encoder = new Encoder();

            qrcode.setEncodingHint(true);
            qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.Q);
            qrcode.write(new QRByte(message));
            qrcode.make();
            const output: string = qrcode.toDataURL().split(",")[1];

            const imagePath = "./tmp/qr.png";
            fs.writeFileSync(
                imagePath,
                output,
                { encoding: "base64" }
            );

            await client.sendMessage(
                Athena.chatId,
                fs.readFileSync(imagePath),
                MessageType.image,
                {
                    caption: QR.IMAGE_CAPTION,
                }).catch((err) =>
                    inputSanitization.handleError(err, client, Athena)
                );

            inputSanitization.deleteFiles(imagePath);
            return;

        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    }
};
