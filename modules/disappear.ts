import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Client from "../sidekick/client";
import { proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js"

export default  {
    name: "disappear",
    description: STRINGS.disappear.DESCRIPTION,
    extendedDescription: STRINGS.disappear.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: [".disappear", ".disappear off"] },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            var time: any = 7 * 24 * 60 * 60;
            if (Athena.isPm) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            if (Athena.isGroup) {
                if (chat.message.extendedTextMessage == null) {
                    await client.sock.sendMessage(
                        Athena.chatId,
                        {disappearingMessagesInChat: time}
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                } else {
                    await client.sock.sendMessage(
                        Athena.chatId,
                        {disappearingMessagesInChat: false}
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                }
                return;
            }
            if (chat.message.extendedTextMessage.contextInfo.expiration == 0) {
                time = 7 * 24 * 60 * 60;
            } else {
                time = false;
            }
            await client.sock.sendMessage(
                Athena.chatId,
                {disappearingMessagesInChat: time}
                ).catch(err => inputSanitization.handleError(err, client, Athena));
            return;
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
