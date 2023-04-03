// Temporarily Disabled.

// const { MessageType, Mimetype } = require("@adiwajshing/baileys");
// const Strings = require("../lib/db");
// const format = require("python-format-js");
// const inputSanitization = require("../sidekick/input-sanitization");
// const CPP = Strings.cpp;
// const fs = require("fs");
// const { promisify } = require('util');
// const exec = promisify(require("child_process").exec);
// var execFile = require('child_process').execFile
// const config = require('../config')

// module.exports = {
//     name: "cpp",
//     description: CPP.DESCRIPTION,
//     extendedDescription: CPP.EXTENDED_DESCRIPTION,
//     demo: { isEnabled: true, text: ['.cpp printf("Hello from Athena!");', '.cpp float x, y;\ncin >> x >> y;\ncout<<"sum of provide numbers is -> " << x + y; -i 6 0.9', '.cpp #include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  cout << "Athena is the best!" << endl;\n}'] },
//     async handle(client, chat, Athena, args) {
//         try {
//             if (args[0] == null) {
//                 await client.sendMessage(
//                     Athena.chatId,
//                     CPP.NO_INPUT,
//                     MessageType.text
//                 ).catch(err => inputSanitization.handleError(err, client, Athena));
//                 return;
//             }
//             var processing = await client.sendMessage(
//                 Athena.chatId,
//                 CPP.PROCESSING,
//                 MessageType.text
//             )
//             var body = Athena.body.replace(
//                 Athena.body[0] + Athena.commandName + " ",
//                 ""
//             );
//             try{
//                 var text = body.split("-i")
//                 var code = text[0]
//                 var input = text[1].substring(1)

//             }catch(err){
//                 var code = body;
//             }
//             var cpp = ""
//             if (!(/main\(/g.test(code))) {
//                 cpp = CPP.BOILERPLATE.replace("{code}", code);
//             } else {
//                 cpp = code;
//             }
//             fs.writeFileSync('./tmp/cpp-Athena.cpp', cpp);
//             var out = {
//                 stderr: 'N/A',
//                 stdout: 'N/A',
//                 code: cpp
//             }
//             var compile = "g++ ./tmp/cpp-Athena.cpp -o ./tmp/cppAthena.out"
//             var execute = "env -i ./tmp/cppAthena.out"
//             try {
//                 await exec(compile)
//                 var child = execFile("env -i ./tmp/cppAthena.out", [], {shell: true},
//                     async function (error, stdout, stderr) {
//                         if(stdout){
//                             out.stdout = stdout
//                         }
//                         if(stderr){
//                             out.stderr = stderr
//                         }else if(error){
//                             if(error.code == null){
//                                 out.stderr = "Execution timed out (10 seconds). Please make sure that the input has been provided and is in correct order. Use the``` *.help cpp* ```command for more info!"
//                             }else{
//                                 out.stderr = error
//                             }
//                             out.stdout = "N/A"
//                         }
//                         await client.sendMessage(
//                             Athena.chatId,
//                             CPP.OUTPUT_TEMPLATE.format(out),
//                             MessageType.text
//                         )
//                         await client.deleteMessage(Athena.chatId, {
//                             id: processing.key.id,
//                             remoteJid: Athena.chatId,
//                             fromMe: true,
//                         })
//                     }
//                 );
//                 if(input){
//                     child.stdin.setEncoding('utf-8');
//                     child.stdin.write(input + "\n");
//                     out.code += "\n\nWith Input - " + input
//                 }
//             } catch (err) {
//                 out.stderr = err.stderr
//                 await client.sendMessage(
//                     Athena.chatId,
//                     CPP.OUTPUT_TEMPLATE.format(out),
//                     MessageType.text
//                 )
//                 return await client.deleteMessage(Athena.chatId, {
//                     id: processing.key.id,
//                     remoteJid: Athena.chatId,
//                     fromMe: true,
//                 })
//             }
//             setTimeout(() => {
//                 try{
//                     child.kill(); // Does not terminate the Node.js process in the shell.
//                     inputSanitization.deleteFiles(
//                         "./tmp/cppAthena.out",
//                         "./tmp/cpp-Athena.cpp"
//                     );
//                 }catch(err){
//                     // Do nothing lmao
//                 }
//             }, 10000);
//         } catch (err) {
//             await inputSanitization.handleError(err, client, Athena);
//         }
//     }
// };
