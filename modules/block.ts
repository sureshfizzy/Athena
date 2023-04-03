import Strings from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js"
import inputSanitization from "../sidekick/input-sanitization.js";
const Reply = Strings.block;

export default  {
    name: "block",
    description: Reply.DESCRIPTION,
    extendedDescription: Reply.EXTENDED_DESCRIPTION,
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            const reply: proto.Message.IExtendedTextMessage = chat.message.extendedTextMessage;
            var contact: string = "";
            if(args.length == 0 && !Athena.isTextReply){
                client.sendMessage(
                    Athena.chatId,
                    Reply.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }

            if (!(args.length > 0) && Athena.isTextReply) {
                contact = reply.contextInfo.participant.split("@")[0];
            } else {
                contact = await inputSanitization.getCleanedContact(
                    args,
                    client,
                    Athena
                );
            }

            if (contact === Athena.owner.split("@")[0]) {
                client.sendMessage(
                    Athena.chatId,
                    Reply.NOT_BLOCK_BOT,
                    MessageType.text
                );
                return;
            }

            if(contact === ""){
                client.sendMessage(
                    Athena.chatId,
                    Reply.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }
            var JID: string = contact + "@s.whatsapp.net";
            client.sock.updateBlockStatus(JID, "block");
            client.sendMessage(
                Athena.chatId,
                "*" + contact + " blocked successfully.*",
                MessageType.text
            );
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                Athena,
                Reply.MESSAGE_NOT_TAGGED
            );
        }
    },
};
