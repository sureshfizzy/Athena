import {AnyMessageContent, GroupMetadata, GroupParticipant, proto, WASocket} from "@whiskeysockets/baileys";
import {MessageType} from "./message-type.js";
import Athena from "./sidekick.js";

class Client {
    sock: WASocket;
    store: any;

    constructor(sock: WASocket, store: any) {
        this.sock = sock;
        this.store = store;
    }

    async sendMessage(jid: string, content: any, type: string, options?: any) {
        let res: proto.WebMessageInfo;
        let ops: AnyMessageContent;
        if (type === MessageType.text) {
            ops = {
                text: content
            }
            if (options?.contextInfo?.mentionedJid) {
                ops.mentions = options.contextInfo.mentionedJid
            }
            res = await this.sock.sendMessage(jid, ops, options);
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type === MessageType.sticker) {
            res = await this.sock.sendMessage(jid, {
                sticker: new Buffer(content)
            })
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type === MessageType.audio) {
            res = await this.sock.sendMessage(jid, {
                audio: content,
                mimetype: 'audio/mp4'
            })
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type === MessageType.image) {
            ops = {
                image: content,
            }
            if (options?.caption) {
                ops.caption = options.caption;
            }
            res = await this.sock.sendMessage(jid, ops);
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type == MessageType.audio) {
            res = await this.sock.sendMessage(jid, {
                audio: content,
                mimetype: 'audio/mp3'
            });
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type === MessageType.buttonsMessage) {
            res = await this.sock.sendMessage(jid, content);
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type == MessageType.video) {
            ops = {
                video: content,
            }
            if (options?.caption) {
                ops.caption = options.caption;
            }
            res = await this.sock.sendMessage(jid, ops);
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type === MessageType.document) {
            ops = {
                text: options.caption
            }
            let ops2: any = {
                document: content,
            }
            if (options?.mimetype) {
                ops2.mimetype = options.mimetype;
                ops2.fileName = options.filename;
            }
            // console.log(ops2);
            await this.sock.sendMessage(jid, ops);
            res = await this.sock.sendMessage(jid, ops2);
            await this.sendMessage(jid, {
                text: "🪄",
                key: res.key,
            }, MessageType.react);
        } else if (type === MessageType.react) {
            res = await this.sock.sendMessage(jid, {
                react: content
            });
        }
        return res;
    };

    async deleteMessage(jid: string, key: any) {
        await this.sock.sendMessage(jid, {
            delete: key
        });
    };

    async getGroupMetaData(jid: string, Athena: Athena) {
        const groupMetadata: GroupMetadata = jid.endsWith("@g.us") ? await this.sock.groupMetadata(jid) : null;
        const getGroupAdmins = (participants: GroupParticipant[]): string[] => {
            var admins: string[] = [];
            for (var i in participants) {
                participants[i].admin ? admins.push(participants[i].id) : '';
            }
            // console.log("ADMINS -> " + admins);
            return admins;
        }
        Athena.groupName = Athena.isGroup ? groupMetadata.subject : null;
        Athena.groupMembers = Athena.isGroup ? groupMetadata.participants : null;
        Athena.groupAdmins = Athena.isGroup ? getGroupAdmins(Athena.groupMembers) : null;
        Athena.groupId = Athena.isGroup ? groupMetadata.id : null;
        Athena.isBotGroupAdmin = Athena.isGroup ? (Athena.groupAdmins.includes(Athena.owner)) : false;
        Athena.isSenderGroupAdmin = Athena.isGroup ? (Athena.groupAdmins.includes(Athena.sender)) : false;
    }
}

export default Client;
