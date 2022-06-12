const roomChatHandler = require('../modules/group-chat-message/handler');
const privateChatHandler = require('../modules/chat-message/handler');
const supportGroupHandler = require('../modules/support-group/handler');
const s3Upload = require('../utils/file_upload/s3UploadAdaptor');

const { logger } = global;

const { HTTP_OK, HTTP_CREATED } = require('../utils/http.response.code');
const { default: mongoose } = require('mongoose');

exports.createGroupMessage = async (req, res) => {
  try {
    const data = {
      ...res.locals.validatedBody,
      user: res.locals.user.pid,
      group: req.params.groupId,
    };
    if (req.body.file) {
      const assetUrl = await s3Upload({
        folder: 'support_chats',
        file: req.body.file,
      });

      data.assetUrl = assetUrl;
    }
    const message = await roomChatHandler.sendMessage(data);
    // emit socket event
    global.io.emit(`${req.params.groupId}`, message);
    // initialise last message
    supportGroupHandler.updateLastChatMessage(req.params.groupId, message._id);

    res
      .status(HTTP_CREATED)
      .json({ message: 'chat message sent successfully', chat: message });
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.fetchGroupMessages = async (req, res) => {
  try {
    const result = await roomChatHandler.getMessages(req.params.groupId);

    let messages = [];

    result.forEach((message) => {
      const isSender = message.user._id.equals(res.locals.user.pid)
        ? true
        : false;

      messages.push({
        _id: message._id,
        isSender: isSender,
        message: message.message,
        assetUrl: message.assetUrl,
        user: message.user,
        group: message.group,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    });
    res.status(HTTP_OK).json({ messages });
  } catch (err) {
    logger.error(err);
    res.status(err.code || 500).json(err);
  }
};

exports.deleteGroupMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await roomChatHandler.deleteMessage(id, res.locals.user.pid);
    if (!result) {
      return res.status(400).json({
        message: 'cannot delete message, data not found',
        success: false,
      });
    } else {
      return res.status(HTTP_OK).json({ success: true, ...result });
    }
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.initPrivateChat = async (req, res) => {
  try {
    const users = [res.locals.user.pid, req.params.withUserId];
    // check private exists
    let chat = await privateChatHandler.getSinglePrivateChat({
      users: { $all: users },
    });

    if (!chat) {
      chat = await privateChatHandler.createPrivateChat(users);
    }
    res.status(HTTP_CREATED).json(chat);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.getPrivateChats = async (req, res) => {
  try {
    const chats = await privateChatHandler.getUserPrivateChats(
      mongoose.Types.ObjectId(res.locals.user.pid),
      mongoose.Types.ObjectId(res.locals.user.id)
    );
    res.status(HTTP_CREATED).json(chats);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.setUserTyping = async (req, res) => {
  const { username, typingState } = req.body;

  if (!username || !typingState) {
    return res
      .status(err.code)
      .json({ error: 'username or typing state is required' });
  }

  const chatId = req.params.chatId;

  const typingData = {
    name: username,
    isTyping: !typingState ? false : true,
    userAccountId: res.locals.user.pid,
    chatId: chatId,
  };

  // emit socket event for typing
  global.io.emit(`typing:${chatId}`, typingData);

  res.status(200).json({ success: 'Ok' });
};

exports.getSinglePrivateChat = async (req, res) => {
  try {
    const chats = await privateChatHandler.getSinglePrivateChat({
      _id: req.params.chatId,
    });
    res.status(HTTP_CREATED).json(chats);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.createPrivateChatMessage = async (req, res) => {
  try {
    const data = {
      ...res.locals.validatedBody,
      sender: res.locals.user.pid,
      receiver: req.params.toId,
      chatId: req.params.chatId,
    };

    if (req.body.file) {
      const assetUrl = await s3Upload({
        folder: 'private_chats',
        file: req.body.file,
      });

      data.assetUrl = assetUrl;
    }

    // get receiver data from chat
    const chat = await privateChatHandler.getSinglePrivateChat({
      _id: req.params.chatId,
    });

    const getReceiverId = chat.users.filter(
      (user) => user._id.toString() != res.locals.user.pid.toString()
    );

    data.receiver = getReceiverId[0];

    const message = await privateChatHandler.sendPrivateChatMessage(data);
    // emit socket event
    global.io.emit(`${req.params.chatId}`, message);
    // initialise last message
    privateChatHandler.updateLastChatMessage(req.params.chatId, message._id);

    res
      .status(HTTP_CREATED)
      .json({ message: 'chat message sent successfully', chat: message });
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.getPrivateChatMessages = async (req, res) => {
  try {
    const result = await privateChatHandler.getPrivateChatMessages(
      req.params.chatId
    );

    let messages = [];

    result.forEach((message) => {
      const isSender = message.sender._id.equals(res.locals.user.pid)
        ? true
        : false;

      messages.push({
        _id: message._id,
        isSender: isSender,
        message: message.message,
        assetUrl: message.assetUrl,
        sender: message.sender,
        receiver: message.receiver,
        chatId: message.chatId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    });

    res.status(HTTP_OK).json({ messages });
  } catch (err) {
    res.status(err.code).json(err);
  }
};

exports.updateGroupMessageReads = async (req, res) => {
  try {
    const readsData = {
      readByUserId: mongoose.Types.ObjectId(res.locals.user.id),
    };

    await roomChatHandler.updateUserMessageReads(
      mongoose.Types.ObjectId(req.params.groupId),
      readsData
    );

    res.status(HTTP_OK).json({ message: 'Group messages read updated' });
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.updatePrivateChatMessageReads = async (req, res) => {
  try {
    const readsData = {
      readByUserId: mongoose.Types.ObjectId(res.locals.user.id),
    };

    await privateChatHandler.updateUserMessageReads(
      mongoose.Types.ObjectId(req.params.chatId),
      readsData
    );

    res.status(HTTP_OK).json({ message: 'Chat messages read updated' });
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.deletePrivateChatMessage = async (req, res) => {
  try {
    const result = await privateChatHandler.deletePrivateChatMessage(
      req.params.id
    );
    if (!result) {
      return res.status(400).json({
        message: 'cannot delete message, data not found',
        success: false,
      });
    } else {
      return res.status(HTTP_OK).json({ success: true, ...result });
    }
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};
