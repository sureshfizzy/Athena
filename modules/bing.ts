import Strings from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Client from "../sidekick/client";
import {proto} from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import {MessageType} from "../sidekick/message-type.js";
import {config} from "../config.js";

let BingChat = await import( 'bing-chat')
//
const bing = Strings.bing;
const contexts = {};

//@ts-ignore
const sendMessageToBing = async (api: BingChat, message: string, client: Client, Athena: Athena, chat: proto.IWebMessageInfo) => {
    const mes = await client.sendMessage(
        Athena.chatId,
        bing.TYPING,
        MessageType.text
    );
    if (Object.hasOwn(contexts, Athena.sender)) {
        try {
            const res = await api.sendMessage(message, contexts[Athena.sender])
            await client.deleteMessage(Athena.chatId, mes.key)
            await client.sendMessage(
                Athena.chatId,
                bing.HEADER_TEXT + res.text,
                MessageType.text,
                {quoted: chat},
            );

        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }

    } else {
        try {
            const res = await api.sendMessage(message)

            await client.deleteMessage(Athena.chatId, mes.key)

            await client.sendMessage(
                Athena.chatId,
                bing.HEADER_TEXT + res.text,
                MessageType.text,
                {quoted: chat},
            );
            contexts[Athena.sender] = res
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    }
}

export default {
    name: "bing",
    description: bing.DESCRIPTION,
    extendedDescription: bing.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ".bing"},
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (config.BING_COOKIE.trim().length == 0) {
                client.sendMessage(
                    Athena.chatId,
                    bing.NO_COOKIE_SET,
                    MessageType.text
                );
            } else {
                const api = new BingChat.BingChat({
                    cookie: config.BING_COOKIE
                })
                const message = Athena.body.slice(5)
                if (message.trim().length == 0) {
                    if (Athena.isTextReply && Athena.replyMessage.trim().length > 0) {
                        sendMessageToBing(api, Athena.replyMessage, client, Athena, chat);
                    } else {
                        await client.sendMessage(
                            Athena.chatId,
                            "_" + bing.EMPTY_MESSAGE + "_",
                            MessageType.text
                        );
                    }
                } else {
                    if (message.trim() == 'reset') {
                        delete contexts[Athena.sender];
                        await client.sendMessage(
                            Athena.chatId,
                            bing.CONVERSATION_RESET,
                            MessageType.text
                        );

                    } else {
                        sendMessageToBing(api, message, client, Athena, chat);
                    }
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
