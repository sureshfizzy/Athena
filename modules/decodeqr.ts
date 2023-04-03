import Jimp from "jimp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import inputSanitization from "../sidekick/input-sanitization.js";
import qrCode from "qrcode-reader";
import Strings from "../lib/db.js";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { Transform } from "stream";
import { downloadContentFromMessage, proto } from "@adiwajshing/baileys";
import { URL } from "url";

const DECODE = Strings.decodeqr;

export default  {
    name: "dqr",
    description: DECODE.DESCRIPTION,
    extendedDescription: DECODE.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        var processing: proto.WebMessageInfo;

        // Function to convert qr to text 
        const qrToText = async (imagePath: string, processing: proto.WebMessageInfo): Promise<void> => {
            var buffer: Buffer = fs.readFileSync(imagePath);
            Jimp.read(buffer, function (err, image) {
                if (err) {
                    console.error(err);
                }
                let qrcode: any = new qrCode();
                qrcode.callback = async function (err: string | string[], value: { result: any; }) {
                    if (err) {
                        console.error(err);
                        if (err.includes('enough finder patterns')) {
                            await client
                                .sendMessage(Athena.chatId, Strings.decodeqr.INVALID_INPUT, MessageType.text);
                        }
                    } else {
                        await client
                            .sendMessage(Athena.chatId, value.result, MessageType.text)
                            .catch((err) =>
                                inputSanitization.handleError(err, client, Athena)
                            );
                    }
                };

                // Decoding the QR code
                qrcode.decode(image.bitmap);
            });

            //Image and message deletion
            await inputSanitization.deleteFiles(imagePath);
            return await client
                .deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                })
                .catch((err) => inputSanitization.handleError(err, client, Athena));
        };

        // Function to convert sticker to image
        const convertToImage = async (stickerId: string, replyChat: { message: any; type: any; }, processing: proto.WebMessageInfo): Promise<void> => {
            const fileName: string = "./tmp/convert_to_image-" + stickerId;
            const stream: Transform = await downloadContentFromMessage(replyChat.message, replyChat.type);
            await inputSanitization.saveBuffer(fileName, stream);
            const imagePath: string = "./tmp/image-" + stickerId + ".png";

            try {
                ffmpeg(fileName)
                    .save(imagePath)
                    .on("error", async function (err, stdout, stderr) {
                        inputSanitization.deleteFiles(fileName);
                        throw err;
                    })
                    .on("end", async () => {
                        inputSanitization.deleteFiles(fileName);
                        qrToText(imagePath, processing);
                    });

            } catch (err) {
                await inputSanitization.handleError(err, client, Athena);
            }
        };

        try {
            if (!Athena.isTextReply || (Athena.isReplyAudio || Athena.isReplyVideo || Athena.isReplyAnimatedSticker)) {

                await client
                    .sendMessage(Athena.chatId, DECODE.INVALID_REPLY, MessageType.text)
                    .catch((err) => inputSanitization.handleError(err, client, Athena));
                return;

            } else if (Athena.isReplySticker) {

                processing = await client
                    .sendMessage(Athena.chatId, DECODE.PROCESSING, MessageType.text);
                var replyChatObject = {
                    message: chat.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage,
                    type: 'sticker'
                };
                var stickerId: string = chat.message?.extendedTextMessage?.contextInfo?.stanzaId;
                await convertToImage(stickerId, replyChatObject, processing);

            } else if (Athena.isReplyImage) {

                processing = await client
                    .sendMessage(Athena.chatId, DECODE.PROCESSING, MessageType.text);
                var imageId: string = chat?.message?.extendedTextMessage?.contextInfo?.stanzaId;
                const fileName: string = "./tmp/qr_pic" + imageId;
                const stream: Transform = await downloadContentFromMessage(chat.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');
                await inputSanitization.saveBuffer(fileName, stream);
                qrToText(fileName, processing);

            } else if (!Athena.isImage) {

                await client
                    .sendMessage(Athena.chatId, DECODE.INVALID_INPUT, MessageType.text)
                    .catch((err) => inputSanitization.handleError(err, client, Athena));
                return;

            }

        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
