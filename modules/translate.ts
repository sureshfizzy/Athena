import translate from "@vitalets/google-translate-api";
import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";
import format from "string-format";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";

export default  {
    name: "tr",
    description: STRINGS.tr.DESCRIPTION,
    extendedDescription: STRINGS.tr.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tr やめてください",
            ".tr how are you | hindi",
            ".tr how are you | hi",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        const processing = await client.sendMessage(
            Athena.chatId,
            STRINGS.tr.PROCESSING,
            MessageType.text
        );
        try {
            var text = "";
            var language = "";
            if (args.length == 0) {
                await client.sendMessage(
                    Athena.chatId,
                    STRINGS.tr.EXTENDED_DESCRIPTION,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return await client.deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
            }
            if (!Athena.isTextReply) {
                try {
                    var body = Athena.body.split("|");
                    text = body[0].replace(
                        Athena.body[0] + Athena.commandName + " ",
                        ""
                    );
                    var i = 0;
                    while (body[1].split(" ")[i] == "") {
                        i++;
                    }
                    language = body[1].split(" ")[i];
                } catch (err) {
                    if (err instanceof TypeError) {
                        text = Athena.body.replace(
                            Athena.body[0] + Athena.commandName + " ",
                            ""
                        );
                        language = "English";
                    }
                }
            } else if (Athena.replyMessage) {
                text = Athena.replyMessage;
                language = args[0];
            } else {
                await client.sendMessage(
                    Athena.chatId,
                    STRINGS.tr.INVALID_REPLY,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return await client.deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
            }
            if (text.length > 4000) {
                await client.sendMessage(
                    Athena.chatId,
                    format(STRINGS.tr.TOO_LONG, String(text.length)),
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return await client.deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
            }
            await translate(text, {
                to: language,
            })
                .then((res) => {
                    client.sendMessage(
                        Athena.chatId,
                        format(
                            STRINGS.tr.SUCCESS,
                            res.from.language.iso,
                            language,
                            res.text
                        ),
                        MessageType.text
                    );
                })
                .catch((err) => {
                    inputSanitization.handleError(
                        err,
                        client,
                        Athena,
                        STRINGS.tr.LANGUAGE_NOT_SUPPORTED
                    );
                });
            return await client.deleteMessage(Athena.chatId, {
                id: processing.key.id,
                remoteJid: Athena.chatId,
                fromMe: true,
            });
        } catch (err) {
            inputSanitization.handleError(err, client, Athena);
        }
    },
};
