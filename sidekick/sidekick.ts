import {GroupParticipant} from '@whiskeysockets/baileys'

class Athena {

    mimeType: string;
    type: string;
    body: string;
    commandName: string;
    chatId: string;
    owner: string;
    logGroup: string;
    sender: string;
    groupName: string;
    groupMembers: GroupParticipant[];
    groupAdmins: string[];
    groupId: string;
    replyMessageId: string;
    replyMessage: string;
    imageCaption: string;
    replyParticipant: string;

    isTextReply: boolean;
    isCmd: boolean;
    fromMe: boolean;
    isGroup: boolean;
    isPm: boolean;
    isBotGroupAdmin: boolean;
    isSenderGroupAdmin: boolean;
    isSenderSUDO: boolean;
    isImage: boolean;
    isReplyImage: boolean;
    isGIF: boolean;
    isReplyGIF: boolean;
    isSticker: boolean;
    isReplySticker: boolean;
    isReplyVideo: boolean;
    isReplyAudio: boolean;
    isVideo: boolean;
    isAudio: boolean;
    isReplyAnimatedSticker: boolean
}

export default Athena;
