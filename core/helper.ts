import {config} from '../config.js'
import chalk from 'chalk'
import AthenaClass from '../sidekick/sidekick.js'
import {proto, WASocket} from '@whiskeysockets/baileys'


const resolve = async function (messageInstance: proto.IWebMessageInfo, client: WASocket) {
    var Athena: AthenaClass = new AthenaClass();
    var prefix: string = config.PREFIX + '\\w+'
    var prefixRegex: RegExp = new RegExp(prefix, 'g');
    var SUDOstring: string = config.SUDO;
    try {
        var jsonMessage: string = JSON.stringify(messageInstance);
    } catch (err) {
        console.log(chalk.redBright("[ERROR] Something went wrong. ", err))
    }

    Athena.chatId = messageInstance.key.remoteJid;
    Athena.fromMe = messageInstance.key.fromMe;
    Athena.owner = client.user.id.replace(/:.*@/g, '@');
    Athena.mimeType = messageInstance.message ? (Object.keys(messageInstance.message)[0] === 'senderKeyDistributionMessage' ? Object.keys(messageInstance.message)[2] : (Object.keys(messageInstance.message)[0] === 'messageContextInfo' ? Object.keys(messageInstance.message)[1] : Object.keys(messageInstance.message)[0])) : null;
    Athena.type = Athena.mimeType === 'imageMessage' ? 'image' : (Athena.mimeType === 'videoMessage') ? 'video' : (Athena.mimeType === 'conversation' || Athena.mimeType == 'extendedTextMessage') ? 'text' : (Athena.mimeType === 'audioMessage') ? 'audio' : (Athena.mimeType === 'stickerMessage') ? 'sticker' : (Athena.mimeType === 'senderKeyDistributionMessage' && messageInstance.message?.senderKeyDistributionMessage?.groupId === 'status@broadcast') ? 'status' : null;
    Athena.isTextReply = (Athena.mimeType === 'extendedTextMessage' && messageInstance.message?.extendedTextMessage?.contextInfo?.stanzaId) ? true : false;
    Athena.replyMessageId = messageInstance.message?.extendedTextMessage?.contextInfo?.stanzaId;
    Athena.replyParticipant = messageInstance.message?.extendedTextMessage?.contextInfo?.participant.replace(/:.*@/g, '@');
    ;
    Athena.replyMessage = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;
    Athena.body = Athena.mimeType === 'conversation' ? messageInstance.message?.conversation : (Athena.mimeType == 'imageMessage') ? messageInstance.message?.imageMessage.caption : (Athena.mimeType == 'videoMessage') ? messageInstance.message?.videoMessage.caption : (Athena.mimeType == 'extendedTextMessage') ? messageInstance.message?.extendedTextMessage?.text : (Athena.mimeType == 'buttonsResponseMessage') ? messageInstance.message?.buttonsResponseMessage.selectedDisplayText : null;
    console.log("Your message is ", messageInstance);

    Athena.isCmd = prefixRegex.test(Athena.body);
    Athena.commandName = Athena.isCmd ? Athena.body.slice(1).trim().split(/ +/).shift().toLowerCase().split('\n')[0] : null;
    Athena.isImage = Athena.type === "image";
    Athena.isReplyImage = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ? true : false;
    Athena.imageCaption = Athena.isImage ? messageInstance.message?.imageMessage.caption : null;
    Athena.isGIF = (Athena.type === 'video' && messageInstance.message?.videoMessage?.gifPlayback);
    Athena.isReplyGIF = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.gifPlayback ? true : false;
    Athena.isSticker = Athena.type === 'sticker';
    Athena.isReplySticker = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage ? true : false;
    Athena.isReplyAnimatedSticker = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage?.isAnimated;
    Athena.isVideo = (Athena.type === 'video' && !messageInstance.message?.videoMessage?.gifPlayback);
    Athena.isReplyVideo = Athena.isTextReply ? (jsonMessage.indexOf("videoMessage") !== -1 && !messageInstance.message?.extendedTextMessage?.contextInfo.quotedMessage.videoMessage.gifPlayback) : false;
    Athena.isAudio = Athena.type === 'audio';
    Athena.isReplyAudio = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ? true : false;
    Athena.logGroup = client.user.id.replace(/:.*@/g, '@');
    ;
    Athena.isGroup = Athena.chatId.endsWith('@g.us');
    Athena.isPm = !Athena.isGroup;
    Athena.sender = (Athena.isGroup && messageInstance.message && Athena.fromMe) ? Athena.owner : (Athena.isGroup && messageInstance.message) ? messageInstance.key.participant.replace(/:.*@/g, '@') : (!Athena.isGroup) ? Athena.chatId : null;
    Athena.isSenderSUDO = SUDOstring.includes(Athena.sender?.substring(0, Athena.sender.indexOf("@")));

    return Athena;
}

export default resolve;
