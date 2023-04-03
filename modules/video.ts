import chalk from "chalk";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";
import yts from "yt-search";
import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const SONG = STRINGS.song;

export default {
    name: "video",
    description: "Searches for a video on YouTube and downloads the first result",
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            if (args.length === 0) {
                await client.sendMessage(
                    BotsApp.chatId,
                    "Please provide keywords to search for a video",
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            const query = args.join(" ");
            const results = await yts(query);
            const video = results.videos[0];

            if (!video) {
                client.sendMessage(
                    BotsApp.chatId,
                    "No video found for the given keywords",
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            var reply = await client.sendMessage(
                BotsApp.chatId,
                `Downloading "${video.title}"...`,
                MessageType.text
            );

            try {
                var stream = ytdl(video.url, {
                    quality: "highest",
                    filter: 'audioandvideo' // add this option to download videos with both audio and video streams
                });

                ffmpeg(stream)
                    .audioBitrate(320)
                    .toFormat("mp4")
                    .saveToFile(`tmp/${chat.key.id}.mp4`)
                    .on("end", async () => {
                        var upload = await client.sendMessage(
                            BotsApp.chatId,
                            `Uploading "${video.title}"...`,
                            MessageType.text
                        );
                        await client.sendMessage(
                            BotsApp.chatId,
                            fs.readFileSync(`tmp/${chat.key.id}.mp4`),
                            MessageType.video
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        inputSanitization.deleteFiles(`tmp/${chat.key.id}.mp4`);
                        client.deleteMessage(BotsApp.chatId, {
                            id: reply.key.id,
                            remoteJid: BotsApp.chatId,
                            fromMe: true,
                        });
                        client.deleteMessage(BotsApp.chatId, {
                            id: upload.key.id,
                            remoteJid: BotsApp.chatId,
                            fromMe: true,
                        });
                    });
            } catch (err) {
                throw err;
            }
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                BotsApp,
                "Error occurred while searching for the video"
            );
        }
    },
};
