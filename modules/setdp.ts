import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import inputSanitization from "../sidekick/input-sanitization.js";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { downloadContentFromMessage, proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { Transform } from "stream";
const REPLY = String.setdp;

export default  {
    name: "setdp",
    description: REPLY.DESCRIPTION,
    extendedDescription: REPLY.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (!Athena.isGroup) {
                await client.sendMessage(
                    Athena.chatId,
                    REPLY.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            if (!Athena.isImage && !Athena.isReplyImage) {
                await client.sendMessage(
                    Athena.chatId,
                    REPLY.NOT_AN_IMAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            var update = await client.sendMessage(
                Athena.chatId,
                REPLY.ICON_CHANGED,
                MessageType.text
            );
            var imageId = chat.key.id;
            const fileName = "./tmp/change_pic" + imageId;
            if (Athena.isImage) {
                const stream: Transform = await downloadContentFromMessage(chat.message.imageMessage, 'image');
                await inputSanitization.saveBuffer(fileName, stream);
            } else {
                const stream: Transform = await downloadContentFromMessage(chat.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');
                await inputSanitization.saveBuffer(fileName, stream);
            }

            const imagePath = "./tmp/image-" + imageId + ".png";
            ffmpeg(fileName)
                .outputOptions(["-y", "-vcodec png", "-s 500x500"])
                .videoFilters(
                    "scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease:eval=frame,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2,setsar=1:1"
                )
                .save(imagePath)
                .on("end", async () => {
                    client.sock.updateProfilePicture(
                        Athena.chatId,
                        fs.readFileSync(imagePath)
                    ).catch(err => inputSanitization.handleError(err, client, Athena));

                    //Image and message deletion
                    inputSanitization.deleteFiles(fileName, imagePath);
                    return await client.deleteMessage(Athena.chatId, {
                        id: update.key.id,
                        remoteJid: Athena.chatId,
                        fromMe: true,
                    }).catch(err => inputSanitization.handleError(err, client, Athena));
                });
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
        return;
    },
};
