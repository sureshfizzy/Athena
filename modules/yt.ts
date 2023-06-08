import yts from "yt-search";
import inputSanitization from "../sidekick/input-sanitization.js";
import Strings from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const YT = Strings.yt;

export default {
    name: "yt",
    description: YT.DESCRIPTION,
    extendedDescription: YT.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".yt Athena Deployment Tutorial" },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if(args.length === 0){
                await client.sendMessage(
                    Athena.chatId,
                    YT.ENTER_INPUT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            const keyword = await yts(args.join(" "));
            const videos = keyword.videos.slice(0, 10);
            var topRequests = "";
            var num = 1;
            var reply = await client.sendMessage(
                Athena.chatId,
                YT.REPLY,
                MessageType.text
            );

            videos.forEach(function (links) {
                topRequests =
                    topRequests +
                    `*${num}.)* ${links.title} (${links.timestamp}) | *${links.author.name}* | ${links.url}\n\n`;
                num++;
            });

            if (topRequests === "") {
                client.sendMessage(
                    Athena.chatId,
                    YT.NO_VIDEOS,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                await client.deleteMessage(Athena.chatId, {
                    id: reply.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
                return;
            }

            await client.sendMessage(Athena.chatId, topRequests, MessageType.text).catch(err => inputSanitization.handleError(err, client, Athena));
            await client.deleteMessage(Athena.chatId, {
                id: reply.key.id,
                remoteJid: Athena.chatId,
                fromMe: true,
            });
        } catch (err) {
            await client.sendMessage(
                Athena.chatId,
                YT.NO_VIDEOS,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, Athena));
            await client.deleteMessage(Athena.chatId, {
                id: reply.key.id,
                remoteJid: Athena.chatId,
                fromMe: true,
            });
            return;
        }
    },
};
