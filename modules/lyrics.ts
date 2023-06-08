import Client from "../sidekick/client.js";
import Athena from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type.js";
import { proto } from "@whiskeysockets/baileys";
import got, {Response} from "got";
import inputSanitization from "../sidekick/input-sanitization.js";
import STRINGS from "../lib/db.js";

const songlyrics = (await import("songlyrics")).default;

export default  {
    name: "lyrics",
    description: STRINGS.lyrics.DESCRIPTION,
    extendedDescription: STRINGS.lyrics.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".lyrics Stairway to heaven" },
    async handle(client: Client, chat: proto.IWebMessageInfo, Athena: Athena, args: string[]): Promise<void> {
        const processing: proto.WebMessageInfo = await client.sendMessage(
            Athena.chatId,
            STRINGS.lyrics.PROCESSING,
            MessageType.text
        );
        try {
            var song: string = "";
            if (Athena.isTextReply) {
                song = Athena.replyMessage;
            } else if (args.length == 0) {
                client.sendMessage(
                    Athena.chatId,
                    STRINGS.lyrics.NO_ARG,
                    MessageType.text
                );
                return;
            } else {
                song = args.join(" ");
            }
            let Response: Response<string> = await got(
                `https://some-random-api.ml/lyrics/?title=${song}`
            );
            let data = JSON.parse(Response.body);
            let caption: string =
                "*Title :* " +
                data.title +
                "\n*Author :* " +
                data.author +
                "\n*Lyrics :*\n" +
                data.lyrics;

            try {
                await client.sendMessage(
                    Athena.chatId,
                    { url: data.thumbnail.genius },
                    MessageType.image,
                    {
                        caption: caption,
                    }
                );
            } catch (err) {
                client.sendMessage(Athena.chatId, caption, MessageType.text);
            }
            await client.deleteMessage(Athena.chatId, {
                id: processing.key.id,
                remoteJid: Athena.chatId,
                fromMe: true,
            });
            // return;
        } catch (err) {
            try{
                let data = await songlyrics(song)
                let caption: string =
                    "*Title :* " +
                    song +
                    "\n*Source :* " +
                    data.source.link +
                    "\n*Lyrics :*\n" +
                    data.lyrics;
    
                await client.sendMessage(Athena.chatId, caption, MessageType.text);
                await client.deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
            }catch(err){
                await inputSanitization.handleError(
                    err,
                    client,
                    Athena,
                    STRINGS.lyrics.NOT_FOUND
                );
                return await client.deleteMessage(Athena.chatId, {
                    id: processing.key.id,
                    remoteJid: Athena.chatId,
                    fromMe: true,
                });
            }
        }
    },
};
