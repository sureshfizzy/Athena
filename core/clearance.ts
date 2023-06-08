import chalk from 'chalk';
import {config} from '../config.js';
import { adminCommands, sudoCommands } from "../sidekick/input-sanitization.js"
import STRINGS from "../lib/db.js";
import Users from '../database/user.js';
import format from 'string-format';
import Athena from '../sidekick/sidekick.js';
import { WASocket } from '@whiskeysockets/baileys';
import Client from '../sidekick/client.js';
import { MessageType } from '../sidekick/message-type.js';

const GENERAL = STRINGS.general;

const clearance = async (Athena: Athena, client: Client, isBlacklist: boolean): Promise<boolean> => {
    if (isBlacklist) {
        if (Athena.isGroup) {
            await client.getGroupMetaData(Athena.chatId, Athena);
            if ((!Athena.fromMe && !Athena.isSenderSUDO && !Athena.isSenderGroupAdmin)) {
                return false;
            }
        } else if ((!Athena.fromMe && !Athena.isSenderSUDO)) {
            console.log(chalk.blueBright.bold(`[INFO] Blacklisted Chat or User.`));
            return false;
        }
    }
    else if ((Athena.chatId === "917838204238-1634977991@g.us" || Athena.chatId === "120363020858647962@g.us" || Athena.chatId === "120363023294554225@g.us")) {
        console.log(chalk.blueBright.bold(`[INFO] Bot disabled in Support Groups.`));
        return false;
    }
    if (Athena.isCmd && (!Athena.fromMe && !Athena.isSenderSUDO)) {
        if (config.WORK_TYPE.toLowerCase() === "public") {
            if (Athena.isGroup) {
                await client.getGroupMetaData(Athena.chatId, Athena);
                if (adminCommands.indexOf(Athena.commandName) >= 0 && !Athena.isSenderGroupAdmin) {
                    console.log(
                        chalk.redBright.bold(`[INFO] admin commmand `),
                        chalk.greenBright.bold(`${Athena.commandName}`),
                        chalk.redBright.bold(
                            `not executed in public Work Type.`
                        )
                    );
                    await client.sendMessage(
                        Athena.chatId,
                        GENERAL.ADMIN_PERMISSION,
                        MessageType.text
                    );
                    return false;
                } else if (sudoCommands.indexOf(Athena.commandName) >= 0 && !Athena.isSenderSUDO) {
                    console.log(
                        chalk.redBright.bold(`[INFO] sudo commmand `),
                        chalk.greenBright.bold(`${Athena.commandName}`),
                        chalk.redBright.bold(
                            `not executed in public Work Type.`
                        )
                    );
                    let messageSent: boolean = await Users.getUser(Athena.chatId);
                    if (messageSent) {
                        console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + Athena.chatId))
                        return false;
                    }
                    else {
                        await client.sendMessage(
                            Athena.chatId,
                            format(GENERAL.SUDO_PERMISSION, { worktype: "public", groupName: Athena.groupName ? Athena.groupName : "private chat", commandName: Athena.commandName }),
                            MessageType.text
                        );
                        await Users.addUser(Athena.chatId);
                        return false;
                    }
                } else {
                    return true;
                }
            }else if(Athena.isPm){
                return true;
            }
        } else if (config.WORK_TYPE.toLowerCase() != "public" && !Athena.isSenderSUDO) {
            console.log(
                chalk.redBright.bold(`[INFO] commmand `),
                chalk.greenBright.bold(`${Athena.commandName}`),
                chalk.redBright.bold(
                    `not executed in private Work Type.`
                )
            );
            //             let messageSent = await Users.getUser(Athena.chatId);
            //             if(messageSent){
            //                 console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + Athena.chatId))
            //                 return false;
            //             }
            //             else{
            //                 await client.sendMessage(
            //                     Athena.chatId,
            //                     GENERAL.SUDO_PERMISSION.format({ worktype: "private", groupName: Athena.groupName ? Athena.groupName : "private chat", commandName: Athena.commandName }),
            //                     MessageType.text,
            //                     {
            //                         contextInfo: {
            //                             stanzaId: Athena.chatId,
            //                             participant: Athena.sender,
            //                             quotedMessage: {
            //                                 conversation: Athena.body,
            //                             },
            //                         },
            //                     }
            //                 );
            //                 await Users.addUser(Athena.chatId)
            //                 return false;
            //             }
        }
    } else {
        return true;
    }
}

export default clearance;
