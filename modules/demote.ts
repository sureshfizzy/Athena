import inputSanitization from "../sidekick/input-sanitization.js";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const REPLY = String.demote;

export default  {
    name: "demote",
    description: REPLY.DESCRIPTION,
    extendedDescription: REPLY.EXTENDED_DESCRIPTION,
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (!Athena.isGroup) {
                client.sendMessage(
                    Athena.chatId,
                    REPLY.NOT_A_GROUP,
                    MessageType.text
                );
                return;
            }
            await client.getGroupMetaData(Athena.chatId, Athena);
            if (!Athena.isBotGroupAdmin) {
                client.sendMessage(
                    Athena.chatId,
                    REPLY.BOT_NOT_ADMIN,
                    MessageType.text
                );
                return;
            }
            if (!Athena.isTextReply && typeof args[0] == "undefined") {
                client.sendMessage(
                    Athena.chatId,
                    REPLY.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }

            const reply = chat.message.extendedTextMessage;
            if (Athena.isTextReply) {
                var contact = reply.contextInfo.participant.split("@")[0];
            } else {
                var contact = await inputSanitization.getCleanedContact(
                    args,
                    client,
                    Athena
                );
            }
            var admin = false;
            var isMember = await inputSanitization.isMember(
                contact,
                Athena.groupMembers
            );
            var owner = false;
            for (const index in Athena.groupMembers) {
                if (contact == Athena.groupMembers[index].id.split("@")[0]) {
                    console.log(Athena.groupMembers[index]);
                    owner = Athena.groupMembers[index].admin === 'superadmin';
                    admin = Athena.groupMembers[index].admin != undefined;
                }
            }

            if (owner) {
                client.sendMessage(
                    Athena.chatId,
                    "*" + contact + " is the owner of the group*",
                    MessageType.text
                );
                return;
            }

            if (isMember) {
                if (admin) {
                    const arr = [contact + "@s.whatsapp.net"];
                    await client.sock.groupParticipantsUpdate(Athena.chatId, arr, 'demote');
                    client.sendMessage(
                        Athena.chatId,
                        "*" + contact + " is demoted from admin*",
                        MessageType.text
                    );
                    return;
                } else {
                    client.sendMessage(
                        Athena.chatId,
                        "*" + contact + " was not an admin*",
                        MessageType.text
                    );
                    return;
                }
            }
            if (!isMember) {
                if (contact === undefined) {
                    return;
                }

                client.sendMessage(
                    Athena.chatId,
                    REPLY.PERSON_NOT_IN_GROUP,
                    MessageType.text
                );
                return;
            }
            return;
        } catch (err) {
            if (err === "NumberInvalid") {
                await inputSanitization.handleError(
                    err,
                    client,
                    Athena,
                    "```Invalid number ```" + args[0]
                );
            } else {
                await inputSanitization.handleError(err, client, Athena);
            }
        }
    },
};
