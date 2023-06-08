import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import inputSanitization from "../sidekick/input-sanitization.js";
import { MessageType } from "../sidekick/message-type.js";
import Strings from "../lib/db.js";
import Client from "../sidekick/client";
import { downloadContentFromMessage, proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { Transform } from "stream";

const STICKER = Strings.sticker;

export default {
    name: "sticker",
    description: STICKER.DESCRIPTION,
    extendedDescription: STICKER.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        // Task starts here
        try {
            // Function to convert media to sticker
            const convertToSticker = async (imageId: string, replyChat: { message: any; type: any; }): Promise<void> => {
                var downloading: proto.WebMessageInfo = await client.sendMessage(
                    Athena.chatId,
                    STICKER.DOWNLOADING,
                    MessageType.text
                );
                const fileName: string = "./tmp/convert_to_sticker-" + imageId;
                const stream: Transform = await downloadContentFromMessage(replyChat.message, replyChat.type);
                await inputSanitization.saveBuffer(fileName, stream);
                const stickerPath: string = "./tmp/st-" + imageId + ".webp";
                // If is an image
                if (Athena.type === "image" || Athena.isReplyImage) {
                    ffmpeg(fileName)
                        .outputOptions(["-y", "-vcodec libwebp"])
                        .videoFilters(
                            "scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"
                        )
                        .save(stickerPath)
                        .on("end", async () => {
                            await client.sendMessage(
                                Athena.chatId,
                                fs.readFileSync(stickerPath),
                                MessageType.sticker
                            ).catch(err => inputSanitization.handleError(err, client, Athena));
                            await inputSanitization.deleteFiles(
                                fileName,
                                stickerPath
                            );
                            await client.deleteMessage(Athena.chatId, {
                                id: downloading.key.id,
                                remoteJid: Athena.chatId,
                                fromMe: true,
                            }).catch(err => inputSanitization.handleError(err, client, Athena));
                        })
                        .on('error', async (err: any) => {
                            inputSanitization.handleError(err, client, Athena)
                            await client.deleteMessage(Athena.chatId, {
                                id: downloading.key.id,
                                remoteJid: Athena.chatId,
                                fromMe: true,
                            }).catch(err => inputSanitization.handleError(err, client, Athena));
                        });
                    return;
                }
                // If is a video
                ffmpeg(fileName)
                    .duration(8)
                    .outputOptions([
                        "-y",
                        "-vcodec libwebp",
                        "-lossless 1",
                        "-qscale 1",
                        "-preset default",
                        "-loop 0",
                        "-an",
                        "-vsync 0",
                        "-s 600x600",
                    ])
                    .videoFilters(
                        "scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"
                    )
                    .save(stickerPath)
                    .on("end", async (err: any) => {
                        await client.sendMessage(
                            Athena.chatId,
                            fs.readFileSync(stickerPath),
                            MessageType.sticker
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        await inputSanitization.deleteFiles(fileName, stickerPath);
                        await client.deleteMessage(Athena.chatId, {
                            id: downloading.key.id,
                            remoteJid: Athena.chatId,
                            fromMe: true,
                        }).catch(err => inputSanitization.handleError(err, client, Athena));
                    })
                    .on('error', async (err: any) => {
                        inputSanitization.handleError(err, client, Athena)
                        await client.deleteMessage(Athena.chatId, {
                            id: downloading.key.id,
                            remoteJid: Athena.chatId,
                            fromMe: true,
                        }).catch(err => inputSanitization.handleError(err, client, Athena));
                    });
                return;
            };

            // User sends media message along with command in caption
            if (Athena.isImage || Athena.isGIF || Athena.isVideo) {
                var replyChatObject = {
                    message: (Athena.type === 'image' ? chat.message.imageMessage : chat.message.videoMessage),
                    type: Athena.type
                };
                var imageId: string = chat.key.id;
                convertToSticker(imageId, replyChatObject);
            }
            // Replied to an image , gif or video
            else if (
                Athena.isReplyImage ||
                Athena.isReplyGIF ||
                Athena.isReplyVideo
            ) {
                var replyChatObject = {
                    message: (Athena.isReplyImage ? chat.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : chat.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage),
                    type: (Athena.isReplyImage ? 'image' : 'video')
                };
                var imageId: string =
                    chat.message.extendedTextMessage.contextInfo.stanzaId;
                convertToSticker(imageId, replyChatObject);
            } else {
                client.sendMessage(
                    Athena.chatId,
                    STICKER.TAG_A_VALID_MEDIA_MESSAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
            }
            return;
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                Athena,
                STICKER.TAG_A_VALID_MEDIA_MESSAGE
            );
        }
    },
};
