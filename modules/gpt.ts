import Strings from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Client from "../sidekick/client";
import {proto} from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import {MessageType} from "../sidekick/message-type.js";
import {config} from "../config.js";

let ChatGPT = await import( 'chatgpt')
//
const gpt = Strings.gpt;
const contexts = {};

// @ts-ignore
const sendMessageToChatGPT = async (api: BingChat, message: string, client: Client, Athena: Athena, chat: proto.IWebMessageInfo) => {
    const mes = await client.sendMessage(
        Athena.chatId,
        gpt.TYPING,
        MessageType.text
    );
    let chatId = ''; // Athena.sender
    if (Athena.isGroup) {
    } else {
        let chatId = Athena.chatId;
    }
    if (Object.hasOwn(contexts, chatId)) {
        try {
            const res = await api.sendMessage(message, {
                conversationId: contexts[chatId].conversationId,
                parentMessageId: contexts[chatId].id
            })
            await client.deleteMessage(Athena.chatId, mes.key)
            await client.sendMessage(
                Athena.chatId,
                gpt.HEADER_TEXT + res.text,
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
                gpt.HEADER_TEXT + res.text,
                MessageType.text,
                {quoted: chat},
            );
            contexts[chatId] = res
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    }
}

export default {
    name: "gpt",
    description: gpt.DESCRIPTION,
    extendedDescription: gpt.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ".gpt"},
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        console.log({Athena})
        try {
            if (config.OPENAI_ACCESS_TOKEN.trim().length == 0) {
                client.sendMessage(
                    Athena.chatId,
                    gpt.NO_COOKIE_SET,
                    MessageType.text
                );
            } else {
                const api = new ChatGPT.ChatGPTUnofficialProxyAPI({
                    accessToken: config.OPENAI_ACCESS_TOKEN,
                    apiReverseProxyUrl: 'https://api.pawan.krd/backend-api/conversation'

                })
                const message = Athena.body.slice(4)
                if (message.trim().length == 0) {
                    if (Athena.isTextReply && Athena.replyMessage.trim().length > 0) {
                        await sendMessageToChatGPT(api, Athena.replyMessage, client, Athena, chat);
                    } else {
                        client.sendMessage(
                            Athena.chatId,
                            "_" + gpt.EMPTY_MESSAGE + "_",
                            MessageType.text
                        );
                    }
                } else {
                    if (message.trim() == 'reset') {
                        delete contexts[Athena.chatId];
                        client.sendMessage(
                            Athena.chatId,
                            gpt.CONVERSATION_RESET,
                            MessageType.text
                        );
                    } else {
                        await sendMessageToChatGPT(api, message, client, Athena, chat);
                    }
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
