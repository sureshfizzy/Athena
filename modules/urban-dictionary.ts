import got from "got";
import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";
import format from "string-format";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import ud from "urban-dictionary";

export default  {
    name: "ud",
    description: STRINGS.ud.DESCRIPTION,
    extendedDescription: STRINGS.ud.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".ud bruh" },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        const processing = await client.sendMessage(
            Athena.chatId,
            STRINGS.ud.PROCESSING,
            MessageType.text
        );
        try {
            var text: string = "";
            if (args.length == 0) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.ud.NO_ARG,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            } else {
                text = args.join(" ");
            }

            let Response = await ud.define(text);
            console.log(Response);
            let result = Response.reduce(function (prev, current) {
                return prev.thumbs_up + prev.thumbs_down >
                    current.thumbs_up + current.thumbs_down
                    ? prev
                    : current;
            });

            result.definition = result.definition.replace(/\[/g, "_");
            result.definition = result.definition.replace(/\]/g, "_");
            result.example = result.example.replace(/\[/g, "_");
            result.example = result.example.replace(/\]/g, "_");

            let msg =
                "*Word :* " +
                result.word +
                "\n\n*Meaning :*\n" +
                result.definition +
                "\n\n*Example:*\n" +
                result.example +
                "\n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n👍" +
                result.thumbs_up +
                "  👎" +
                result.thumbs_down;

            await client.deleteMessage(Athena.chatId, {
                id: processing.key.id,
                remoteJid: Athena.chatId,
                fromMe: true,
            });

            await client.sendMessage(Athena.chatId, msg, MessageType.text).catch(err => inputSanitization.handleError(err, client, Athena));
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                Athena,
                format(STRINGS.ud.NOT_FOUND, text)
            );
            return await client.deleteMessage(Athena.chatId, {
                id: processing.key.id,
                remoteJid: Athena.chatId,
                fromMe: true,
            });
        }
        return;
    },
};
