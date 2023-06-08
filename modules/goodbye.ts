import Strings from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import Greetings from "../database/greeting.js";
import Client from "../sidekick/client";
import { proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
const GOODBYE = Strings.goodbye;

export default  {
    name: "goodbye",
    description: GOODBYE.DESCRIPTION,
    extendedDescription: GOODBYE.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [".goodbye", ".goodbye off", ".goodbye delete"],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            if (!Athena.isGroup) {
                client.sendMessage(
                    Athena.chatId,
                    GOODBYE.NOT_A_GROUP,
                    MessageType.text
                );
                return;
            }
            if (args.length == 0) {
                await client.getGroupMetaData(Athena.chatId, Athena);
                var Msg: any = await Greetings.getMessage(Athena.chatId, "goodbye");
                try {
                    var enabled = await Greetings.checkSettings(
                        Athena.chatId,
                        "goodbye"
                    );
                    if (enabled === false || enabled === undefined) {
                        client.sendMessage(
                            Athena.chatId,
                            GOODBYE.SET_GOODBYE_FIRST,
                            MessageType.text
                        );
                        return;
                    } else if (enabled === "OFF") {
                        await client.sendMessage(
                            Athena.chatId,
                            GOODBYE.CURRENTLY_DISABLED,
                            MessageType.text
                        );
                        await client.sendMessage(
                            Athena.chatId,
                            Msg.message,
                            MessageType.text
                        );
                        return;
                    }

                    await client.sendMessage(
                        Athena.chatId,
                        GOODBYE.CURRENTLY_ENABLED,
                        MessageType.text
                    );
                    await client.sendMessage(
                        Athena.chatId,
                        Msg.message,
                        MessageType.text
                    );
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
                            GOODBYE.GREETINGS_UNENABLED,
                            MessageType.text
                        );
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
                            GOODBYE.GREETINGS_ENABLED,
                            MessageType.text
                        );
                        return;
                    }
                    if (args[0] === "delete") {
                        var Msg: any = await Greetings.deleteMessage(
                            Athena.chatId,
                            "goodbye"
                        );
                        if (Msg === false || Msg === undefined) {
                            client.sendMessage(
                                Athena.chatId,
                                GOODBYE.SET_GOODBYE_FIRST,
                                MessageType.text
                            );
                            return;
                        }
                        await client.sendMessage(
                            Athena.chatId,
                            GOODBYE.GOODBYE_DELETED,
                            MessageType.text
                        );

                        return;
                    }
                    let text = Athena.body.replace(
                        Athena.body[0] + Athena.commandName + " ",
                        ""
                    );

                    var Msg: any = await Greetings.getMessage(
                        Athena.chatId,
                        "goodbye"
                    );
                    if (Msg === false || Msg === undefined) {
                        await Greetings.setGoodbye(Athena.chatId, text);
                        await client.sendMessage(
                            Athena.chatId,
                            GOODBYE.GOODBYE_UPDATED,
                            MessageType.text
                        );

                        return;
                    } else {
                        await Greetings.deleteMessage(
                            Athena.chatId,
                            "goodbye"
                        );
                        await Greetings.setGoodbye(Athena.chatId, text);
                        await client.sendMessage(
                            Athena.chatId,
                            GOODBYE.GOODBYE_UPDATED,
                            MessageType.text
                        );
                        return;
                    }
                } catch (err) {
                    throw err;
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
