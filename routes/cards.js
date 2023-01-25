const { CARD_CONSTANTS } = require("../config/constant.js");
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { userAuth, userAdminAuth, adminAuth } = require("../middleware/auth");
const _ = require("lodash");
const { Card, validateCardPost, validateCardPut } = require("../models/card");
const { User } = require("../models/user");
const { createCustomer, deleteCustomer } = require("../services/stripeFunctions");

router.get("/", userAuth, async (req, res) => {
  var cardList = await Card.aggregate([
    { $match: { userId: req.jwtData.userId, status: "active" } },
    { $addFields: { cardId: "$_id" } },
    { $project: { __v: 0, _id: 0, customer: 0, customerId: 0, cardToken: 0, stripeCardId: 0, stripeCustomerId: 0 } },
    { $sort: { insertDate: -1 } }
  ]);
  return res.send({ statusCode: 200, message: "Success", data: { cardList } });
});

router.post("/", userAuth, async (req, res) => {
  const { error } = validateCardPost(req.body);
  if (error) return res.status(400).send({ statusCode: 400, message: "Failure", data: error.details[0].message });

  let user = await User.findOne({ _id: req.jwtData.userId });
  if (!user) return res.status(400).send({ statusCode: 400, message: "Failure", data: CARD_CONSTANTS.INVALID_USER });

  let card = new Card(
    _.pick(req.body, [
      "cardToken",
      "nameOnCard",
      "cardScheme",
      "cardType",
      "expiryMonth",
      "expiryYear",
      "maskedCard",
      "isDefault"
    ])
  );

  if (card.isDefault) {
    await Card.updateMany({ userId: req.jwtData.userId }, { $set: { isDefault: false } });
  }
  // create stripe customer for future use.
  let customerObj = {
    email: user.email,
    mobile: user.mobile,
    description: "This is customer create via adding card",
    stripeToken: req.body.cardToken,
    metadata: {
      userId: req.jwtData.userId,
      cardId: card._id.toString()
    }
  };

  let customer = await createCustomer(customerObj);
  if (customer.statusCode != 200) {
    return res.status(400).send({ statusCode: 400, message: "Failure", data: customer.data });
  }
  card.userId = req.jwtData.userId;
  card.stripeCustomerId = customer.data.id;
  card.stripeCardId = customer.data.default_source;
  card.status = "active";

  await card.save();
  card.cardId = card._id;
  let response = _.pick(card, [
    "cardId",
    "userId",
    "nameOnCard",
    "cardScheme",
    "cardType",
    "expiryMonth",
    "expiryYear",
    "maskedCard",
    "isDefault"
  ]);

  res.send({ statusCode: 200, message: "Success", data: response });
});

router.post("/default", userAuth, async (req, res) => {
  if (req.body.cardId) {
    var card = await Card.findOne({ _id: req.body.cardId });
    if (!card) return res.status(400).send({ statusCode: 400, message: "Failure", data: CARD_CONSTANTS.INVALID_CARD });
  } else {
    return res.status(400).send({ statusCode: 400, message: "Failure", data: CARD_CONSTANTS.CARD_REQUIRED });
  }

  card.isDefault = true;
  card.status = req.body.status || card.status;

  await Card.updateMany({ userId: req.jwtData.userId }, { $set: { isDefault: false } });
  await card.save();
  return res.send({ statusCode: 200, message: "Success", data: CARD_CONSTANTS.SET_DEFAULT });
});

router.delete("/:cardId", userAuth, async (req, res) => {
  let card = await Card.findOne({ _id: req.params.cardId, status: "active" });
  if (!card) {
    res.status(400).send({ statusCode: 400, message: "Failure", data: CARD_CONSTANTS.INVALID_CARD });
  }
  await deleteCustomer(card.customerId);
  var result = await Card.updateOne({ _id: req.params.cardId }, { $set: { status: "deleted" } });
  //console.log("Result: ", result);
  if (result.n == 1) return res.send({ statusCode: 200, message: "Success", data: CARD_CONSTANTS.CARD_DELETE_SUCCESS });
  else return res.status(400).send({ statusCode: 400, message: "Failure", data: CARD_CONSTANTS.INVALID_CARD });
});

module.exports = router;
