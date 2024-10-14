const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/userModel");
const {
  ConversationModel,
  MessageModel
} = require("../models/conversationModel");
const getConversation = require("../helpers/getConversation");

const app = express();

// *** socket connection ***
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

/*
 * socket running at http:localhost:8080/
 */

// online user

const onlineUser = new Set();

io.on("connection", async (socket) => {
  //   console.log("connect User ", socket.id);

  // this token is from Home.js in the frontend (client)
  const token = socket.handshake.auth.token;
  //   console.log("token from socket connection : ", token);

  // current user details
  const user = await getUserDetailsFromToken(token);

  //   console.log("user ", user);
  // create a room
  socket.join(user?._id.toString());
  // this will only accept one unique connection
  onlineUser.add(user?._id.toString());

  // the onlineUser that is in a set will be converted to an array and sent to the client side
  io.emit("onlineUser", Array.from(onlineUser));

  // this is coming from the message page in client side
  // PREVIOUS MESSAGES AND OTHER USER DETAIL
  socket.on("message-page", async (userId) => {
    // console.log("userId : ", userId);
    // fetch the details of the user we open their message
    const userDetails = await UserModel.findById(userId).select(
      "-password -__v"
    );

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUser.has(userId)
    };

    socket.emit("message-user", payload);

    // get previous message
    // we will get all the conversation
    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id }
      ]
    })
      .populate("messages")
      .sort({ updatedAt: -1 }); // it will be sorted in the descending order because -1 is descending

    // we will send all their previous conversation
    socket.emit("message", getConversationMessage?.messages || []);
  });

  // NEW MESSAGE
  // socket.on() is when we are receiving a message while socket.emit() is when we are submitting a message
  socket.on("new-message", async (data) => {
    console.log("new message : ", data);

    // check if these two users already have previous conversation
    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender }
      ]
    });

    // if there is no previous conversation
    if (!conversation) {
      // create/insert the new conversation
      const createConversation = new ConversationModel({
        sender: data?.sender,
        receiver: data?.receiver
      });

      conversation = await createConversation.save();
    }

    // we will insert the message to the message table
    const message = new MessageModel({
      text: data?.text,
      imageUrl: data?.imageUrl,
      videoUrl: data?.videoUrl,
      msgByUserId: data?.msgByUserId
    });

    const saveMessage = await message.save();

    // we will update the conversation base on the conversation id and push the message id to the messages array field
    const updateConversation = await ConversationModel.updateOne(
      { _id: conversation?._id },
      {
        $push: { messages: saveMessage?._id }
      }
    );

    // we will get all the conversation
    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender }
      ]
    })
      .populate("messages")
      .sort({ updatedAt: -1 }); // it will be sorted in the descending order because -1 is descending

    // we will send the messages/conversation to the user that sent the message base on the userId
    // we will send the conversational message to the sender
    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    // we will send the conversational message to the receiver
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );

    // Send Conversations
    const conversationSideBarSender = await getConversation(data?.sender);
    const conversationSideBarReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSideBarSender);
    io.to(data?.receiver).emit("conversation", conversationSideBarReceiver);
  });

  // SIDEBAR
  socket.on("sidebar", async (currentUserId) => {
    console.log("current userId : ", currentUserId);
    const conversation = await getConversation(currentUserId);
    socket.emit("conversation", conversation);
  });

  // WHEN THE MESSAGE IS SEEN
  socket.on("seen", async (msgByUserId) => {
    const conversation = await ConversationModel.find({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id }
      ]
    });

    const conversationMessageId = conversation.messages || [];

    const updateMessages = await MessageModel.updateMany(
      {
        _id: { $in: conversationMessageId },
        msgByUserId: msgByUserId
      },
      {
        $set: { seen: true }
      }
    );

    // send conversation
    // Send Conversations
    const conversationSideBarSender = await getConversation(
      user?._id?.toString()
    );
    const conversationSideBarReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit(
      "conversation",
      conversationSideBarSender
    );
    io.to(msgByUserId).emit("conversation", conversationSideBarReceiver);
  });

  // disconnect
  socket.on("disconnect", () => {
    // any user that is disconnected or offline, we will delete the user from the onlineUser set
    onlineUser.delete(user?._id?.toString());
    console.log("disconnect user ", socket.id);
  });
});

module.exports = { app, server };
