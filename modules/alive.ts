import Strings from "../lib/db.js";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization.js";
import { MessageType } from "../sidekick/message-type.js";
import Client from "../sidekick/client";
import { proto } from "@whiskeysockets/baileys";
import Athena from "../sidekick/sidekick";
const alive = Strings.alive;

export default {
    name: "alive",
    description: alive.DESCRIPTION,
    extendedDescription: alive.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".alive" },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            client.sendMessage(
                Athena.chatId,
                alive.ALIVE_MSG,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, Athena));
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
