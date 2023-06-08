import Strings from "../lib/db.js";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization.js";
import {config} from "../config.js";
import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { AnyMediaMessageContent, AnyMessageContent, proto } from "@whiskeysockets/baileys";
import Command from "../sidekick/command";
const HELP = Strings.help;

export default  {
    name: "help",
    description: HELP.DESCRIPTION,
    extendedDescription: HELP.EXTENDED_DESCRIPTION,
    demo: {isEnabled: false},
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[], commandHandler: Map<string, Command>): Promise<void> {
        try {
            var prefixRegex: any = new RegExp(config.PREFIX, "g");
            var prefixes: string = /\/\^\[(.*)+\]\/\g/g.exec(prefixRegex)[1];
            let helpMessage: string;
            if(!args[0]){
                helpMessage = HELP.HEAD;
                commandHandler.forEach(element => {
                    helpMessage += format(HELP.TEMPLATE, prefixes[0] + element.name, element.description);
                });
                client.sendMessage(Athena.chatId, helpMessage, MessageType.text).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            helpMessage = HELP.COMMAND_INTERFACE;
            var command: Command = commandHandler.get(args[0]);
            if(command){
                var triggers: string = " | "
                prefixes.split("").forEach(prefix => {
                    triggers += prefix + command.name + " | "
                });

                if(command.demo?.isEnabled) {
                    var buttons: proto.Message.ButtonsMessage.IButton[] = [];
                    helpMessage += format(HELP.COMMAND_INTERFACE_TEMPLATE, triggers, command.extendedDescription) + HELP.FOOTER;
                    if(command.demo.text instanceof Array){
                        for (var i in command.demo.text){
                            var button: proto.Message.ButtonsMessage.IButton = {
                                buttonId: 'id' + i,
                                buttonText: {displayText: command.demo.text[i]},
                                type: 1
                            }
                            buttons.push(button);
                        }
                    }else{
                        buttons.push({buttonId: 'id1', buttonText: {displayText: command.demo.text}, type: 1});
                    }
                    const buttonMessage = {
                        text: helpMessage,
                        buttons: buttons,
                        headerType: 1
                    }
                    await client.sendMessage(Athena.chatId, buttonMessage, MessageType.buttonsMessage).catch(err => inputSanitization.handleError(err, client, Athena))
                    return;
                }

                helpMessage += format(HELP.COMMAND_INTERFACE_TEMPLATE, triggers, command.extendedDescription);
                client.sendMessage(Athena.chatId, helpMessage, MessageType.text).catch(err => inputSanitization.handleError(err, client, Athena));
                return;
            }
            client.sendMessage(Athena.chatId, HELP.COMMAND_INTERFACE + "```Invalid Command. Check the correct name from```  *.help*  ```command list.```", MessageType.text).catch(err => inputSanitization.handleError(err, client, Athena));
        } catch (err) {
            await inputSanitization.handleError(err, client, Athena);
        }
    },
};
