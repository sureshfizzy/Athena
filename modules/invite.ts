import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js"

export default  {
    name: "invite",
    description: STRINGS.invite.DESCRIPTION,
    extendedDescription: STRINGS.invite.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (!Athena.isGroup) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            await client.getGroupMetaData(Athena.chatId, Athena);
            if (!Athena.isBotGroupAdmin) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.general.BOT_NOT_ADMIN,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            const code = await client.sock.groupInviteCode(Athena.chatId);
            if (Athena.isTextReply) {
                client.sendMessage(
                    chat.message.extendedTextMessage.contextInfo.participant,
                    "https://chat.whatsapp.com/" + code,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.invite.LINK_SENT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            client.sendMessage(
                Athena.chatId,
                "https://chat.whatsapp.com/" + code,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, Athena));
            return;
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
