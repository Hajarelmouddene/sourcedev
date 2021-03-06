const mongoose = require("mongoose");
require("dotenv").config();
const { MONGO_URI } = process.env;
const Conversation = require("../../models/conversation/conversation");
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//send message to Mongo

const sendMessage = async (req, res) => {
  try {
    await mongoose.connect(MONGO_URI, options);
    console.log("Connected to MongoDb");
    console.log("BODY", req.body);
    const conversationsFound = await Conversation.find({
      participants: { $in: req.body.participants },
    });

    console.log("FOUND", conversationsFound);
    //     messageTimeStamp: currentDate,

    if (conversationsFound.length > 0) {
      console.log(req.body.participants[0]);
      const filter = conversationsFound.find(
        (conversation) =>
          conversation.participants.length === req.body.participants.length
      );

      const conversationUpdated = await Conversation.updateOne(filter, {
        $push: {
          messages: [
            {
              senderId: req.body.participants[0],
              messageTimestamp: req.body.messageTimeStamp,
              messageContent: req.body.message,
            },
          ],
        },
        $set: {
          lastMessageTimestamp: req.body.messageTimeStamp,
        },
      });
      if (conversationUpdated.nModified === 1) {
        const conversationsFound = await Conversation.find({
          participants: req.body.participants,
        });
        const filter = conversationsFound.find(
          (conversation) =>
            conversation.participants.length === req.body.participants.length
        );
        const newConversation = await Conversation.find(filter);
        console.log(filter);
        console.log("NEW", newConversation[0]);
        res.status(201).json({
          status: 201,
          message: "conversation updated",
          conversation: newConversation[0],
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "failed to update",
        });
      }
    } else {
      const conversation = new Conversation({
        participants: req.body.participants,
        lastMessageTimestamp: req.body.messageTimeStamp,
        messages: [
          {
            senderId: req.body.participants[0],
            messageTimestamp: req.body.messageTimeStamp,
            messageContent: req.body.message,
          },
        ],
      });

      conversation.save();
      return res.status(201).json({
        status: 201,
        message: "Conversation added.",
        conversation: conversation,
      });
    }
  } catch (error) {
    console.log("ERROR::", error);
  }
  mongoose.connection.close();
};

const getAllConversations = async (req, res) => {
  try {
    await mongoose.connect(MONGO_URI, options);
    console.log("Connected to MongoDb");
    console.log(req.params.id);
    const conversationsFound = await Conversation.find({
      participants: { $in: [req.params.id] },
    });

    if (conversationsFound.length > 0) {
      console.log(conversationsFound);
      res.status(200).json({
        status: 200,
        conversations: conversationsFound,
      });
    } else {
      console.log("in else");
      res.status(404).json({
        status: 404,
        message: "no conversations were found.",
      });
    }
  } catch (error) {
    console.log("ERROR::", error);
  }
  mongoose.connection.close();
};

const updateConversation = async (req, res) => {
  try {
    await mongoose.connect(MONGO_URI, options);
    console.log("Connected to MongoDb");
    console.log(req.body);
    const conversationFound = await Conversation.find({
      _id: req.body.conversationId,
    });

    console.log(conversationFound);
    if (conversationFound.length > 0) {
      const updatedConversation = await Conversation.updateOne({
        _id: req.body.conversationId,
      });
      res.status(200).json({
        status: 200,
        conversation: updatedConversation,
      });
    } else {
      console.log("in else");
      res.status(404).json({
        status: 404,
        message: "no conversations were found.",
      });
    }
  } catch (error) {
    console.log("ERROR::", error);
  }
  mongoose.connection.close();
};

module.exports = {
  sendMessage,
  getAllConversations,
  updateConversation,
};
