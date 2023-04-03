import Strings from "../lib/db.js";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization.js";
import Blacklist from "../database/blacklist.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const rbl = Strings.rbl;

export default  {
    name: "rbl",
    description: rbl.DESCRIPTION,
    extendedDescription: rbl.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".rbl" },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (Athena.isPm && Athena.fromMe) {
                let PersonToRemoveFromBlacklist = Athena.chatId;
                if (!(await Blacklist.getBlacklistUser(PersonToRemoveFromBlacklist, ""))) {
                    client.sendMessage(
                        Athena.chatId,
                        format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                }
                Blacklist.removeBlacklistUser(PersonToRemoveFromBlacklist, "");
                client.sendMessage(
                    Athena.chatId,
                    format(rbl.PM_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                    MessageType.text
                );
                return;
            } else {
                await client.getGroupMetaData(Athena.chatId, Athena);
                if (args.length > 0) {
                    let PersonToRemoveFromBlacklist =
                        await inputSanitization.getCleanedContact(
                            args,
                            client,
                            Athena
                        );

                    if (PersonToRemoveFromBlacklist === undefined) return;
                    PersonToRemoveFromBlacklist += "@s.whatsapp.net";
                    if (
                        !(await Blacklist.getBlacklistUser(
                            PersonToRemoveFromBlacklist,
                            Athena.chatId
                        ))
                    ) {
                        client.sendMessage(
                            Athena.chatId,
                            format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser(
                        PersonToRemoveFromBlacklist,
                        Athena.chatId
                    );
                    client.sendMessage(
                        Athena.chatId,
                        format(rbl.GRP_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else if (Athena.isTextReply) {
                    let PersonToRemoveFromBlacklist = Athena.replyParticipant;
                    if (
                        !(await Blacklist.getBlacklistUser(
                            PersonToRemoveFromBlacklist,
                            Athena.chatId
                        ))
                    ) {
                        client.sendMessage(
                            Athena.chatId,
                            format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser(
                        PersonToRemoveFromBlacklist,
                        Athena.chatId
                    );
                    client.sendMessage(
                        Athena.chatId,
                        format(rbl.GRP_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else {
                    if (
                        !(await Blacklist.getBlacklistUser("", Athena.chatId))
                    ) {
                        client.sendMessage(
                            Athena.chatId,
                            format(rbl.NOT_IN_BLACKLIST, Athena.groupName),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser("", Athena.chatId);
                    client.sendMessage(
                        Athena.chatId,
                        format(rbl.GRP_BAN, Athena.groupName),
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
