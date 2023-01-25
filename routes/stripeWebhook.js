const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
// const { Provider } = require("../models/provider");
const formatter = require("../services/commonFunctions");
//const stripe = require('stripe')('sk_test_BnLAU3UNJKPbDcMamcOaYoui00J4i1jTGO');
const config = require("config");
const STRIPE_KEY = config.get("STRIPE_KEY");
var stripe = require("stripe")(STRIPE_KEY);

router.post("/webhook", async (req, res) => {
    console.log("Webhook: ", JSON.stringify(req.body));

    if (req.body.type == "payout.canceled" || req.body.type == "payout.failed") {
        await handlePayoutFailure(req.body.data.object.metadata.userId);
    } else if (req.body.type == "payout.paid") {
        await handlePayoutSuccess(req.body.data.object.metadata.userId, req.body.data.object.status);
    } else if (req.body.type == "account.updated") {
        await handleAccountUpdate(req.body.data.object.metadata.userId);
    }
    return res.send("OK");
});

router.get("/webhook", async (req, res) => {
    console.log("CODE: ", req.query.code);
    console.log("STATE: ", req.query.state);
    let flag = 0;

    let provider = await Provider.findOne({ _id: req.query.state });
    if (!provider) {
        flag = 1;
        //return res.send("NOT OK");
    }

    let account = await createAccount(req.query.code, req.query.state)
    console.log("Account: ", account);
    if (account.statusCode == 200) {
        console.log(account.data.stripe_user_id);
        provider.stripeAccountData = account.data;
        provider.isStripeIntegrated = true;
        await provider.save();
    }
    else {
        flag = 1;
        //return res.send(account.data);
    }
    //return res.send("OK");
    if (flag == 1) {
        return res.redirect("https://purpleelegant.com/api/result?status=0&message=Onboarding Failed");
    } else {
        return res.redirect("https://purpleelegant.com/api/result?status=1&message=Successfully onboarded");
    }
});

async function createAccount(code, providerId) {
    let finalResponse = {};
    let connected_account_id;
    try {
        let response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code: code,
            metadata: {
                providerId: providerId
            }
        })
        finalResponse.statusCode = 200;
        finalResponse.message = "Success";
        finalResponse.data = response;

    } catch (Ex) {
        finalResponse.statusCode = Ex.statusCode;
        finalResponse.message = "Failure";
        finalResponse.data = Ex.message;
    }
    return finalResponse
}

async function handlePayoutFailure(userId) {

}

async function handlePayoutSuccess(userId, status) {

}

async function handleAccountUpdate(userId) {

}

module.exports = router;
