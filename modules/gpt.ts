import Strings from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Client from "../sidekick/client";
import {proto} from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import {MessageType} from "../sidekick/message-type.js";
import {config} from "../config.js";

let ChatGPT = await import( 'chatgpt')
//
const gpt = Strings.gpt;
const contexts = {};

// @ts-ignore
const sendMessageToChatGPT = async (api: BingChat, message: string, client: Client, BotsApp: BotsApp, chat: proto.IWebMessageInfo) => {
    const mes = await client.sendMessage(
        BotsApp.chatId,
        gpt.TYPING,
        MessageType.text
    );
    let chatId = ''; // BotsApp.sender
    if (BotsApp.isGroup) {
    } else {
        let chatId = BotsApp.chatId;
    }
    if (Object.hasOwn(contexts, chatId)) {
        try {
            const res = await api.sendMessage(message, {
                conversationId: contexts[chatId].conversationId,
                parentMessageId: contexts[chatId].id
            })
            await client.deleteMessage(BotsApp.chatId, mes.key)
            await client.sendMessage(
                BotsApp.chatId,
                gpt.HEADER_TEXT + res.text,
                MessageType.text,
                {quoted: chat},
            );
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }

    } else {
        try {
            const res = await api.sendMessage(message)

            await client.deleteMessage(BotsApp.chatId, mes.key)

            await client.sendMessage(
                BotsApp.chatId,
                gpt.HEADER_TEXT + res.text,
                MessageType.text,
                {quoted: chat},
            );
            contexts[chatId] = res
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    }
}

export default {
    name: "gpt",
    description: gpt.DESCRIPTION,
    extendedDescription: gpt.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ".gpt"},
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        console.log({BotsApp})
        try {
            if (config.OPENAI_ACCESS_TOKEN.trim().length == 0) {
                client.sendMessage(
                    BotsApp.chatId,
                    gpt.NO_COOKIE_SET,
                    MessageType.text
                );
            } else {
                const api = new ChatGPT.ChatGPTUnofficialProxyAPI({
                    accessToken: config.OPENAI_ACCESS_TOKEN,
                    apiReverseProxyUrl: 'https://api.pawan.krd/backend-api/conversation'

                })
                const message = BotsApp.body.slice(4)
                if (message.trim().length == 0) {
                    if (BotsApp.isTextReply && BotsApp.replyMessage.trim().length > 0) {
                        await sendMessageToChatGPT(api, BotsApp.replyMessage, client, BotsApp, chat);
                    } else {
                        client.sendMessage(
                            BotsApp.chatId,
                            "_" + gpt.EMPTY_MESSAGE + "_",
                            MessageType.text
                        );
                    }
                } else {
                    if (message.trim() == 'reset') {
                        delete contexts[BotsApp.chatId];
                        client.sendMessage(
                            BotsApp.chatId,
                            gpt.CONVERSATION_RESET,
                            MessageType.text
                        );
                    } else {
                        await sendMessageToChatGPT(api, message, client, BotsApp, chat);
                    }
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },
};
