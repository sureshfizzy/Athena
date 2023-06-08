import Strings from "../lib/db.js";
const ADMINS = Strings.admins;
import inputSanitization from "../sidekick/input-sanitization.js";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { proto } from "@whiskeysockets/baileys";

export default  {
    name: "admins",
    description: ADMINS.DESCRIPTION,
    extendedDescription: ADMINS.EXTENDED_DESCRIPTION,
    demo: { text: ".admins", isEnabled: true },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (!Athena.isGroup) {
                client.sendMessage(
                    Athena.chatId,
                    ADMINS.NOT_GROUP_CHAT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }

            let message: string = "";
            await client.getGroupMetaData(Athena.chatId, Athena);
            for (let admin of Athena.groupAdmins) {
                let number: string = admin.split("@")[0];
                message += `@${number} `;
            }

            client.sendMessage(Athena.chatId, message, MessageType.text, {
                contextInfo: {
                    mentionedJid: Athena.groupAdmins,
                },
            }).catch(err => inputSanitization.handleError(err, client, Athena));
            return;
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
