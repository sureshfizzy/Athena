import Greetings from "../database/greeting.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Strings from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const WELCOME = Strings.welcome;

export default  {
    name: "welcome",
    description: WELCOME.DESCRIPTION,
    extendedDescription: WELCOME.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [".welcome", ".welcome off", ".welcome delete"],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (!Athena.isGroup) {
                client.sendMessage(
                    Athena.chatId,
                    WELCOME.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            await client.getGroupMetaData(Athena.chatId, Athena);
            var Msg: any = await Greetings.getMessage(Athena.chatId, "welcome");
            if (args.length == 0) {
                var enabled = await Greetings.checkSettings(
                    Athena.chatId,
                    "welcome"
                );
                try {
                    if (enabled === false || enabled === undefined) {
                        client.sendMessage(
                            Athena.chatId,
                            WELCOME.SET_WELCOME_FIRST,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        return;
                    } else if (enabled === "OFF") {
                        await client.sendMessage(
                            Athena.chatId,
                            WELCOME.CURRENTLY_DISABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        await client.sendMessage(
                            Athena.chatId,
                            Msg.message,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        return;
                    }

                    await client.sendMessage(
                        Athena.chatId,
                        WELCOME.CURRENTLY_ENABLED,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                    await client.sendMessage(
                        Athena.chatId,
                        Msg.message,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, Athena));
                } catch (err) {
                    throw err;
                }
            } else {
                try {
                    if (
                        args[0] === "OFF" ||
                        args[0] === "off" ||
                        args[0] === "Off"
                    ) {
                        let switched = "OFF";
                        await Greetings.changeSettings(
                            Athena.chatId,
                            switched
                        );
                        client.sendMessage(
                            Athena.chatId,
                            WELCOME.GREETINGS_UNENABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        return;
                    }
                    if (
                        args[0] === "ON" ||
                        args[0] === "on" ||
                        args[0] === "On"
                    ) {
                        let switched = "ON";
                        await Greetings.changeSettings(
                            Athena.chatId,
                            switched
                        );
                        client.sendMessage(
                            Athena.chatId,
                            WELCOME.GREETINGS_ENABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));

                        return;
                    }
                    if (args[0] === "delete") {
                        var Msg: any = await Greetings.deleteMessage(
                            Athena.chatId,
                            "welcome"
                        );
                        if (Msg === false || Msg === undefined) {
                            client.sendMessage(
                                Athena.chatId,
                                WELCOME.SET_WELCOME_FIRST,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, Athena));
                            return;
                        }

                        await client.sendMessage(
                            Athena.chatId,
                            WELCOME.WELCOME_DELETED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));

                        return;
                    }
                    let text = Athena.body.replace(
                        Athena.body[0] + Athena.commandName + " ",
                        ""
                    );
                    if (Msg === false || Msg === undefined) {
                        await Greetings.setWelcome(Athena.chatId, text);
                        await client.sendMessage(
                            Athena.chatId,
                            WELCOME.WELCOME_UPDATED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));

                        return;
                    } else {
                        await Greetings.deleteMessage(
                            Athena.chatId,
                            "welcome"
                        );
                        await Greetings.setWelcome(Athena.chatId, text);
                        await client.sendMessage(
                            Athena.chatId,
                            WELCOME.WELCOME_UPDATED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));

                        return;
                    }
                } catch (err) {
                    throw err;
                }
            }
        } catch (err) {
            inputSanitization.handleError(err, client, Athena);
            return;
        }
    },
};
