import chalk from "chalk";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";
import yts from "yt-search";
import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";

const SONG = STRINGS.song;

export default {
    name: "song",
    description: SONG.DESCRIPTION,
    extendedDescription: SONG.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".song love of my life",
            ".song https://www.youtube.com/watch?v=0Gc3nvmMQP0",
            ".song https://youtu.be/pWiI9gabW9k",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (args.length === 0) {
                await client.sendMessage(
                    Athena.chatId,
                    SONG.ENTER_SONG,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            var reply = await client.sendMessage(
                Athena.chatId,
                SONG.DOWNLOADING,
                MessageType.text
            );

            var Id = " ";
            if (args[0].includes("youtu")) {
                Id = args[0];
                try {
                    if (args[0].includes("watch?v=")) {
                        var songId = args[0].split("watch?v=")[1];
                    } else {
                        var songId = args[0].split("/")[3];
                    }
                    const video = await yts({ videoId: songId });
                } catch (err) {
                    console.error(err);
                    await client.sendMessage(
                        Athena.chatId,
                        "Invalid song. Please try again.",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }
            } else {
                var song = await yts(args.join(" "));
                song = song.all;
                if (song.length < 1) {
                    await client.sendMessage(
                        Athena.chatId,
                        "Song not found. Please try again.",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }
                Id = song[0].url;
            }
            try {
                var stream = ytdl(Id, {
                    quality: "highestaudio",
                });

                ffmpeg(stream)
                    .audioBitrate(320)
                    .toFormat("ipod")
                    .saveToFile(`tmp/${chat.key.id}.mp3`)
                    .on("end", async () => {
                        var upload = await client.sendMessage(
                            Athena.chatId,
                            SONG.UPLOADING,
                            MessageType.text
                        );
                        await client.sendMessage(
                            Athena.chatId,
                            {
                                url: `tmp/${chat.key.id}.mp3`,
                                mimetype: "audio/mpeg",
                            },
                            MessageType.audio
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        fs.unlinkSync(`tmp/${chat.key.id}.mp3`);
                    })
                    .on("error", async (err) => {
                        console.error(err);
                        await client.sendMessage(
                            Athena.chatId,
                            "Error downloading song. Please try again.",
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                    });
            } catch (err) {
                console.error(err);
                await client.sendMessage(
                    Athena.chatId,
                    "Error downloading song. Please try again.",
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
            }
        } catch (err) {
            console.error(err);
            await client.sendMessage(
                Athena.chatId,
                "Error while processing your request. Please try again.",
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, Athena));
        } finally {
            fs.unlink(`tmp/${chat.key.id}.mp3`, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    },
};