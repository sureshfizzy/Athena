import chalk from "chalk";
import String from "../lib/db.js";
import * as Carbon from "unofficial-carbon-now";
import inputSanitization from "../sidekick/input-sanitization.js";
import format from "string-format";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { proto } from "@whiskeysockets/baileys";

const CARBON = String.carbon;

export default  {
    name: "carbon",
    description: CARBON.DESCRIPTION,
    extendedDescription: CARBON.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".carbon Hi! Welcome to Athena.",
            '.carbon #include <iostream> \nint main() \n{\n   std::cout << "Hello Athena!"; \n   return 0;\n} -t yeti',
            ".carbon -t",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        try {
            let themes: string[] = [
                "3024 night",
                "a11y dark",
                "blackboard",
                "base 16 (dark)",
                "base 16 (light)",
                "cobalt",
                "duotone",
                "hopscotch",
                "lucario",
                "material",
                "monokai",
                "night owl",
                "nord",
                "oceanic next",
                "one light",
                "one dark",
                "panda",
                "paraiso",
                "seti",
                "shades of purple",
                "solarized (dark)",
                "solarized (light)",
                "synthwave '84",
                "twilight",
                "verminal",
                "vscode",
                "yeti",
                "zenburn",
            ];
            let code: string = "";
            let themeInput: string;
            if (args[0] == null && !Athena.isTextReply) {
                await client.sendMessage(
                    Athena.chatId,
                    CARBON.NO_INPUT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            } else if (Athena.isTextReply && !Athena.replyMessage) {
                await client.sendMessage(
                    Athena.chatId,
                    CARBON.INVALID_REPLY,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            } else if (Athena.isTextReply) {
                code = Athena.replyMessage;
                themeInput = themes[Math.floor(Math.random() * themes.length)];
            } else {
                try {
                    let text: string = Athena.body.replace(
                        Athena.body[0] + Athena.commandName + " ",
                        ""
                    );
                    if (text[0] === "-" && text[1] === "t") {
                        if(text[2] == null){
                            let counter: number = 1;
                            let message: string = 'Available themes: ';
                            themes.forEach((theme) => {
                                message += `\n${counter}. ${theme}`;
                                counter += 1;
                            })
                            await client.sendMessage(
                                Athena.chatId,
                                "```" + message + "```",
                                MessageType.text
                            )
                            return;
                        }
                        else{
                            await client.sendMessage(
                                Athena.chatId,
                                CARBON.NO_INPUT,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, Athena));
                            return;
                        }
                    }
                    let body: string[] = Athena.body.split("-t");
                    code = body[0].replace(
                        Athena.body[0] + Athena.commandName + " ",
                        ""
                    );
                    themeInput = body[1].substring(1);
                    if (!themes.includes(themeInput)) {
                        await client.sendMessage(
                            Athena.chatId,
                            CARBON.INVALID_THEME,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, Athena));
                        return;
                    }
                } catch (err) {
                    if (err instanceof TypeError) {
                        code = Athena.body.replace(
                            Athena.body[0] + Athena.commandName + " ",
                            ""
                        );
                        themeInput =
                            themes[Math.floor(Math.random() * themes.length)];
                    }
                }
            }
            try {
                const processing: proto.WebMessageInfo = await client.sendMessage(
                    Athena.chatId,
                    CARBON.CARBONIZING,
                    MessageType.text
                );
                const carbon = new Carbon.createCarbon()
                    .setCode(code)
                    .setPrettify(true)
                    .setTheme(themeInput);
                const output = await Carbon.generateCarbon(carbon);
                await client.sendMessage(
                    Athena.chatId,
                    output,
                    MessageType.image,
                    {
                        caption: format(CARBON.OUTPUT, themeInput),
                    }
                ).catch(err => inputSanitization.handleError(err, client, Athena));
                return await client.deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
            } catch (err) {
                throw err;
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
