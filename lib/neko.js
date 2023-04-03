// Disabled till fix can be found.

// const { MessageType } = require("@adiwajshing/baileys");
// const inputSanitization = require("../sidekick/input-sanitization");
// const String = require("../lib/db.js");
// const got = require("got");
// const REPLY = String.neko;
// module.exports = {
//     name: "neko",
//     description: REPLY.DESCRIPTION,
//     extendedDescription: REPLY.EXTENDED_DESCRIPTION,
//     demo: {
//         isEnabled: true,
//         text: '.neko #include <iostream> \nint main() \n{\n   std::cout << "Hello Athena!"; \n   return 0;\n}',
//     },
//     async handle(client, chat, Athena, args) {
//         try {
//             if (args.length === 0 && !Athena.isReply) {
//                 await client.sendMessage(
//                     Athena.chatId,
//                     REPLY.ENTER_TEXT,
//                     MessageType.text
//                 ).catch(err => inputSanitization.handleError(err, client, Athena));
//                 return;
//             }
//             const processing = await client.sendMessage(
//                 Athena.chatId,
//                 REPLY.PROCESSING,
//                 MessageType.text
//             ).catch(err => inputSanitization.handleError(err, client, Athena));
//             if (!Athena.isReply) {
//                 var json = {
//                     content: Athena.body.replace(
//                         Athena.body[0] + Athena.commandName + " ",
//                         ""
//                     ),
//                 };
//             } else {
//                 var json = {
//                     content: Athena.replyMessage.replace(
//                         Athena.body[0] + Athena.commandName + " ",
//                         ""
//                     ),
//                 };
//             }
//             let text = await got.post("https://nekobin.com/api/documents", {
//                 json,
//             });
//             json = JSON.parse(text.body);
//             neko_url = "https://nekobin.com/" + json.result.key;
//             client.sendMessage(Athena.chatId, neko_url, MessageType.text).catch(err => inputSanitization.handleError(err, client, Athena));
//             return await client.deleteMessage(Athena.chatId, {
//                 id: processing.key.id,
//                 remoteJid: Athena.chatId,
//                 fromMe: true,
//             }).catch(err => inputSanitization.handleError(err, client, Athena));
//         } catch (err) {
//             if (json.result == undefined) {
//                 await inputSanitization.handleError(
//                     err,
//                     client,
//                     Athena,
//                     REPLY.TRY_LATER
//                 );
//             } else {
//                 await inputSanitization.handleError(err, client, Athena);
//             }
//             return await client.deleteMessage(Athena.chatId, {
//                 id: processing.key.id,
//                 remoteJid: Athena.chatId,
//                 fromMe: true,
//             }).catch(err => inputSanitization.handleError(err, client, Athena));
//         }
//     },
// };
