import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";

export default  {
    name: "remove",
    description: STRINGS.remove.DESCRIPTION,
    extendedDescription: STRINGS.remove.EXTENDED_DESCRIPTION,
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
            let owner: string;
            for (const index in Athena.groupMembers) {
                if (Athena.groupMembers[index].admin === 'superadmin') {
                    owner = Athena.groupMembers[index].id.split("@")[0];
                }
            }
            if (Athena.isTextReply) {
                let PersonToRemove =
                    chat.message.extendedTextMessage.contextInfo.participant;
                if (PersonToRemove === owner + "@s.whatsapp.net") {
                    client.sendMessage(
                        Athena.chatId,
                        "*" + owner + " is the owner of the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }
                if (PersonToRemove === Athena.owner) {
                    client.sendMessage(
                        Athena.chatId,
                        "```Why man, why?! Why would you use my powers to remove myself from the group?!🥺```\n*Request Rejected.* 😤",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }
                var isMember = inputSanitization.isMember(
                    PersonToRemove,
                    Athena.groupMembers
                );
                if (!isMember) {
                    client.sendMessage(
                        Athena.chatId,
                        "*person is not in the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                }
                try {
                    if (PersonToRemove) {
                        await client.sock.groupParticipantsUpdate(Athena.chatId, [PersonToRemove], 'remove').catch(err => inputSanitization.handleError(err, client, Athena));
                        return;
                    }
                } catch (err) {
                    throw err;
                }
                return;
            }
            if (!args[0]) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.remove.INPUT_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            if (args[0][0] == "@") {
                const number = args[0].substring(1);
                if (parseInt(args[0]) === NaN) {
                    client.sendMessage(
                        Athena.chatId,
                        STRINGS.remove.INPUT_ERROR,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }

                if((number + "@s.whatsapp.net") === Athena.owner){
                    client.sendMessage(
                        Athena.chatId,
                        "```Why man, why?! Why would you use my powers to remove myself from the group?!🥺```\n*Request Rejected.* 😤",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }

                if (!(number === owner)) {
                    await client.sock.groupParticipantsUpdate(Athena.chatId, [number + "@s.whatsapp.net"], 'remove').catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                } else {
                    client.sendMessage(
                        Athena.chatId,
                        "*" + owner + " is the owner of the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    return;
                }
            }
            client.sendMessage(
                Athena.chatId,
                STRINGS.remove.INPUT_ERROR,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, Athena));
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
            return;
        }
    },
};
