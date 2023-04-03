import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import {config} from "../config.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import format from "string-format";
import fs from 'fs';
const ADD = STRINGS.add;

export default  {
    name: "add",
    description: ADD.DESCRIPTION,
    extendedDescription: ADD.EXTENDED_DESCRIPTION,
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
            if (!args[0]) {
                client.sendMessage(
                    Athena.chatId,
                    ADD.NO_ARG_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            let number;
            if (parseInt(args[0]) === NaN || args[0][0] === "+" || args[0].length < 10) {
                client.sendMessage(
                    Athena.chatId,
                    ADD.NUMBER_SYNTAX_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            if (args[0].length == 10 && !(parseInt(args[0]) === NaN)) {
                number = config.COUNTRY_CODE + args[0];
            } else {
                number = args[0];
            }
            const [exists] = await client.sock.onWhatsApp(
                number + "@s.whatsapp.net"
            );
            if (!(exists)) {
                client.sendMessage(
                    Athena.chatId,
                    format(ADD.NOT_ON_WHATSAPP, number),
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            const response: any = await client.sock.groupParticipantsUpdate(Athena.chatId, [number + "@s.whatsapp.net"], 'add');

            // if (response[number + "@c.us"] == 408) {
            //     client.sendMessage(
            //         Athena.chatId,
            //         ADD.NO_24HR_BAN,
            //         MessageType.text
            //     ).catch(err => inputSanitization.handleError(err, client, Athena));
            //     return;
            // } else if (response[number + "@c.us"] == 403) {
            //     for (const index in response.participants) {
            //         if ((number + "@c.us") in response.participants[index]) {
            //             var code = response.participants[index][number + "@c.us"].invite_code;
            //             var tom = response.participants[index][number + "@c.us"].invite_code_exp;
            //         }
            //     }
            //     var invite = {
            //         caption: "```Hi! You have been invited to join this WhatsApp group by Athena!```\n\n🔗https://myAthena.com",
            //         groupJid: Athena.groupId,
            //         groupName: Athena.groupName,
            //         inviteCode: code,
            //         inviteExpiration: tom,
            //         jpegThumbnail: fs.readFileSync('./images/Athena_invite.jpeg')
            //     }
            //     await client.sendMessage(
            //         number + "@s.whatsapp.net",
            //         invite,
            //         MessageType.groupInviteMessage
            //     );
            //     client.sendMessage(
            //         Athena.chatId,
            //         ADD.PRIVACY,
            //         MessageType.text
            //     ).catch(err => inputSanitization.handleError(err, client, Athena));
            //     return;
            // } else if (response[number + "@c.us"] == 409) {
            //     client.sendMessage(
            //         Athena.chatId,
            //         ADD.ALREADY_MEMBER,
            //         MessageType.text
            //     ).catch(err => inputSanitization.handleError(err, client, Athena));
            //     return;
            // }
            client.sendMessage(
                Athena.chatId,
                "```" + number + ADD.SUCCESS + "```",
                MessageType.text
            );
        } catch (err) {
            if (err.status == 400) {
                await inputSanitization.handleError(
                    err,
                    client,
                    Athena,
                    ADD.NOT_ON_WHATSAPP
                ).catch(err => inputSanitization.handleError(err, client, Athena));
            }
            await inputSanitization.handleError(err, client, Athena);
        }
        return;
    },
};
