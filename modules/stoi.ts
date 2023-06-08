import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import inputSanitization from "../sidekick/input-sanitization.js";
import Strings from "../lib/db.js";
import Client from "../sidekick/client";
import { downloadContentFromMessage, proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { Transform } from "stream";
const STOI = Strings.stoi;

export default  {
    name: "stoi",
    description: STOI.DESCRIPTION,
    extendedDescription: STOI.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        // Task starts here
        try {
            // Function to convert media to sticker
            const convertToImage = async (stickerId: string, replyChat: { message: proto.Message.IStickerMessage; type: any; }) => {
                var downloading = await client.sendMessage(
                    Athena.chatId,
                    STOI.DOWNLOADING,
                    MessageType.text
                );

                const fileName = "./tmp/convert_to_image-" + stickerId;
                const stream: Transform = await downloadContentFromMessage(replyChat.message, replyChat.type);
                await inputSanitization.saveBuffer(fileName, stream);
                const imagePath = "./tmp/image-" + stickerId + ".png";
                try {
                    ffmpeg(fileName)
                        .save(imagePath)
                        .on("error", function (err, stdout, stderr) {
                            inputSanitization.deleteFiles(fileName);
                            client.deleteMessage(Athena.chatId, {
                                id: downloading.key.id,
                                remoteJid: Athena.chatId,
                                fromMe: true,
                            });
                            throw err;
                        })
                        .on("end", async () => {
                            await client.sendMessage(
                                Athena.chatId,
                                fs.readFileSync(imagePath),
                                MessageType.image,
                            ).catch(err => inputSanitization.handleError(err, client, Athena));
                            await inputSanitization.deleteFiles(fileName, imagePath);
                            return await client.deleteMessage(Athena.chatId, {
                                id: downloading.key.id,
                                remoteJid: Athena.chatId,
                                fromMe: true,
                            }).catch(err => inputSanitization.handleError(err, client, Athena));
                        });
                } catch (err) {
                    throw err;
                }
            };

            if (Athena.isReplySticker && !Athena.isReplyAnimatedSticker) {
                var replyChatObject = {
                    message:
                        chat.message.extendedTextMessage.contextInfo
                            .quotedMessage.stickerMessage,
                    type: 'sticker'
                };
                var stickerId =
                    chat.message.extendedTextMessage.contextInfo.stanzaId;
                convertToImage(stickerId, replyChatObject);
            } else if (Athena.isReplyAnimatedSticker) {
                client.sendMessage(
                    Athena.chatId,
                    STOI.TAG_A_VALID_STICKER_MESSAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            } else {
                client.sendMessage(
                    Athena.chatId,
                    STOI.TAG_A_VALID_STICKER_MESSAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
            }
            return;
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                Athena,
                STOI.ERROR
            );
        }
    },
};
