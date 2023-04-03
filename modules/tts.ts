import { proto } from "@adiwajshing/baileys";
import format from 'string-format';
import * as googleTTS from 'google-tts-api';
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";

const tts = STRINGS.tts;

export default {
    name: "tts",
    description: tts.DESCRIPTION,
    extendedDescription: tts.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ['.tts Hello, how are you?', '.tts Hello, how are you? | en-US-female'] },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        let text: string = '';
        let langCode: string = "en-US";
        let voiceCode: string = "en-US-Wavenet-F";
        if(Athena.isTextReply && Athena.replyMessage){
            text = Athena.replyMessage
        }else if(Athena.isTextReply){
            await client.sendMessage(Athena.chatId, tts.INCORRECT_REPLY, MessageType.text);
            return;
        }else{
            for (var i = 0; i < args.length; i++) {
                if (args[i] == '|') {
                    const codes = args[i + 1].split('-');
                    langCode = codes[0];
                    if (codes.length > 1) {
                        voiceCode = args[i + 1];
                    }
                    break;
                }
                text += args[i] + " ";
            }
        }
        const proccessing: proto.WebMessageInfo = await client.sendMessage(Athena.chatId, tts.PROCESSING, MessageType.text);
        if (text === "") {
            await client.sendMessage(Athena.chatId, tts.NO_INPUT, MessageType.text);
            return await client.deleteMessage(Athena.chatId, { id: proccessing.key.id, remoteJid: Athena.chatId, fromMe: true });
        }
        if (text.length > 200) {
            await client.sendMessage(Athena.chatId, format(tts.TOO_LONG, text.length.toString()), MessageType.text);
        } else {
            try {
                const url: string = googleTTS.getAudioUrl(text, {
                    lang: 'en',
                    slow: false,
                    host: 'https://translate.google.com',
                });
                await client.sendMessage(Athena.chatId, { url: url }, MessageType.audio);
            }
            catch (err) {
                console.log(err);
            }
        }
        return await client.deleteMessage(Athena.chatId, { id: proccessing.key.id, remoteJid: Athena.chatId, fromMe: true });
    }
}
