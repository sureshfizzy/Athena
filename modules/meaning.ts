import Strings from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization.js";
import googleDictionaryApi from "google-dictionary-api";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import format from "string-format";
import { MessageType } from "../sidekick/message-type.js";
import { proto } from "@whiskeysockets/baileys";

const MEANING = Strings.meaning;

export default  {
    name: "meaning",
    description: MEANING.DESCRIPTION,
    extendedDescription: MEANING.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ".meaning meaning"},
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            var word: string = "";
            if (Athena.isTextReply) {
                word = Athena.replyMessage;
            } else if (args.length === 0) {
                client.sendMessage(
                    Athena.chatId,
                    MEANING.NO_ARG,
                    MessageType.text
                );
                return;
            } else {
                word = args.join(" ");
            }
            googleDictionaryApi
                .search(word)
                .then((results) => {
                    let mean: string = "";
                    for(let key in results[0].meaning){
                        mean += "\n\n"
                        mean += "*[" + key + "]* : "
                        mean += results[0].meaning[key][0].definition
                    }
                    const msg: string =
                        "*Word :* " + results[0].word + "\n\n*Meaning :*" + mean;
                    client
                        .sendMessage(Athena.chatId, msg, MessageType.text)
                        .catch((err) =>
                            inputSanitization.handleError(err, client, Athena)
                        );
                })
                .catch(() => {
                    client
                        .sendMessage(
                            Athena.chatId,
                            format(MEANING.NOT_FOUND, word),
                            MessageType.text
                        )
                        .catch((err) =>
                            inputSanitization.handleError(err, client, Athena)
                        );
                });
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
