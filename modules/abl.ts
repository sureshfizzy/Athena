import Strings from "../lib/db.js";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization.js";
import Blacklist from "../database/blacklist.js";
import Client from "../sidekick/client";
import { proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const abl = Strings.abl;

export default  {
    name: "abl",
    description: abl.DESCRIPTION,
    extendedDescription: abl.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".abl" },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (Athena.isPm && Athena.fromMe) {
                let PersonToBlacklist = Athena.chatId;
                Blacklist.addBlacklistUser(PersonToBlacklist, "");
                client.sendMessage(
                    Athena.chatId,
                    format(abl.PM_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                    MessageType.text
                );
                return;
            } else {
                await client.getGroupMetaData(Athena.chatId, Athena);
                if (args.length > 0) {
                    let PersonToBlacklist = await inputSanitization.getCleanedContact(
                        args,
                        client,
                        Athena);
                    if (PersonToBlacklist === undefined) return;
                    PersonToBlacklist += "@s.whatsapp.net";
                    if (Athena.owner === PersonToBlacklist) {
                        client.sendMessage(
                            Athena.chatId,
                            abl.CAN_NOT_BLACKLIST_BOT,
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.addBlacklistUser(
                        PersonToBlacklist,
                        Athena.chatId
                    );
                    client.sendMessage(
                        Athena.chatId,
                        format(abl.GRP_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else if (Athena.isTextReply) {
                    let PersonToBlacklist = Athena.replyParticipant;
                    if (Athena.owner === PersonToBlacklist) {
                        client.sendMessage(
                            Athena.chatId,
                            abl.CAN_NOT_BLACKLIST_BOT,
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.addBlacklistUser(
                        PersonToBlacklist,
                        Athena.chatId
                    );
                    client.sendMessage(
                        Athena.chatId,
                        format(abl.GRP_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else {
                    Blacklist.addBlacklistUser("", Athena.chatId);
                    client.sendMessage(
                        Athena.chatId,
                        format(abl.GRP_BAN, Athena.groupName),
                        MessageType.text
                    );
                    return;
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
