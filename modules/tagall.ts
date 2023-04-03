import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { proto } from "@adiwajshing/baileys";

export default  {
    name: "tagall",
    description: STRINGS.tagall.DESCRIPTION,
    extendedDescription: STRINGS.tagall.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tagall",
            ".tagall Hey everyone! You have been tagged in this message hehe.",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if(Athena.chatId === "917838204238-1632576208@g.us"){
                return; // Disable this for Spam Chat
            }
            if (!Athena.isGroup) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            await client.getGroupMetaData(Athena.chatId, Athena);
            let members = [];
            for (var i = 0; i < Athena.groupMembers.length; i++) {
                members[i] = Athena.groupMembers[i].id;
            }
            if (Athena.isTextReply) {
                let quote = await client.store.loadMessage(Athena.chatId, Athena.replyMessageId, undefined);
                await client.sock.sendMessage(
                    Athena.chatId,
                    {
                        text: STRINGS.tagall.TAG_MESSAGE,
                        mentions: members
                    },
                    {
                        quoted: quote
                    }
                )
                // client.sendMessage(
                //     Athena.chatId,
                //     STRINGS.tagall.TAG_MESSAGE,
                //     MessageType.text,
                //     {
                //         contextInfo: {
                //             stanzaId: Athena.replyMessageId,
                //             participant: Athena.replyParticipant,
                //             quotedMessage: {
                //                 conversation: Athena.replyMessage,
                //             },
                //             mentionedJid: members,
                //         },
                //     }
                // ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            if (args.length) {
                client.sendMessage(
                    Athena.chatId,
                    Athena.body.replace(
                        Athena.body[0] + Athena.commandName + " ",
                        ""
                    ),
                    MessageType.text,
                    {
                        contextInfo: {
                            mentionedJid: members,
                        },
                    }
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }

            client.sendMessage(
                Athena.chatId,
                STRINGS.tagall.TAG_MESSAGE,
                MessageType.text,
                {
                    contextInfo: {
                        mentionedJid: members,
                    },
                }
            ).catch(err => inputSanitization.handleError(err, client, Athena));
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
        return;
    },
};
