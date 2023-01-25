const config = require("config");
const STRIPE_KEY = config.get("STRIPE_KEY");
var stripe = require("stripe")(STRIPE_KEY);

async function createConnectCharge(chargeObject) {
  let finalResponse = {};
  try {
    response = await stripe.charges.create({
      amount: chargeObject.amount,
      currency: chargeObject.currency,
      customer: chargeObject.customer,
      source: chargeObject.source,
      transfer_data: {
        amount: chargeObject.connectAmount,
        destination: chargeObject.connectAccount,
      },
      metadata: chargeObject.metadata
    })
    finalResponse.statusCode = 200;
    finalResponse.message = "Success";
    finalResponse.data = response;
  } catch (Ex) {
    finalResponse.statusCode = Ex.statusCode;
    finalResponse.message = "Failure";
    finalResponse.data = Ex.message;
  }
  return finalResponse;
}

async function createConnectChargeFunction() {
  let chargeObject = {
    amount: 1500, // amount in cents
    currency: "usd",
    customer: "cus_GT82GvwIr4Fl7e",
    source: "card_1FwBm3CeWuM02yOt6Y5JvM2R",
    connectAmount: 1100,
    connectAccount: "acct_1FwBgcJvTrbPfeon",
    metadata: {
      tripId: "req.body.tripId",
      userId: "req.jwtData.userId",
      email: "user.email",
      firstName: "user.firstName",
      mobile: "user.mobile",
      travelDate: "trip.travelDate",
      travelTime: "trip.travelTime",
      travellerName: "req.body.travellerName"
    }
  };
  let response = await createConnectCharge(chargeObject);
  console.log("Response: ", response);
}

async function createCharge(chargeObject) {
  let finalResponse = {};
  try {
    response = await stripe.charges.create({
      amount: chargeObject.amount, // amount in cents
      currency: chargeObject.currency,
      customer: chargeObject.customer,
      source: chargeObject.source,
      // description: chargeObject.description,
      metadata: chargeObject.metadata
    });
    finalResponse.statusCode = 200;
    finalResponse.message = "Success";
    finalResponse.data = response;
  } catch (Ex) {
    finalResponse.statusCode = Ex.statusCode;
    finalResponse.message = "Failure";
    finalResponse.data = Ex.message;
  }
  return finalResponse;
}

async function createChargeFunction() {
  let chargeObject = {
    amount: 1200, // amount in cents
    currency: "usd",
    customer: "cus_GI6y2ZtHxr9lKC",
    source: "card_1FlWkMJkPNpXsbLtOdSWOn2C",
    description: "This is test customer creation",
    metadata: {
      tripId: "req.body.tripId",
      userId: "req.jwtData.userId",
      email: "user.email",
      firstName: "user.firstName",
      mobile: "user.mobile",
      travelDate: "trip.travelDate",
      travelTime: "trip.travelTime",
      travellerName: "req.body.travellerName"
    }
  };
  let response = await createCharge(chargeObject);
  console.log("Response: ", response);
}

async function createCustomer(customerObject) {
  let finalResponse = {};
  try {
    response = await stripe.customers.create({
      source: customerObject.stripeToken,
      email: customerObject.email,
      phone: customerObject.mobile,
      description: customerObject.description,
      metadata: customerObject.metadata
    });
    finalResponse.statusCode = 200;
    finalResponse.message = "Success";
    finalResponse.data = response;
  } catch (Ex) {
    finalResponse.statusCode = Ex.statusCode;
    finalResponse.message = "Failure";
    finalResponse.data = Ex.message;
  }
  return finalResponse;
}

async function createCustomerFunction() {
  let customerObject = {
    email: "cardTest222@gmail.com",
    mobile: "+1111111111",
    description: "This is test customer creation",
    stripeToken: "tok_visa"
  };
  let response = await createCustomer(customerObject);
  console.log("Response: ", JSON.stringify(response));
}

async function updateCustomer(customerObject) {
  let finalResponse = {};
  try {
    response = await stripe.customers.update(customerObject.customerId, {
      source: customerObject.stripeToken,
      email: customerObject.email,
      phone: customerObject.mobile,
      description: customerObject.description
    });
    finalResponse.statusCode = 200;
    finalResponse.message = "Success";
    finalResponse.data = response;
  } catch (Ex) {
    finalResponse.statusCode = Ex.statusCode;
    finalResponse.message = "Failure";
    finalResponse.data = Ex.message;
  }
  return finalResponse;
}

async function updateCustomerFunction() {
  let customerObject = {
    customerId: "cus_GGE7w6wj0e5fki",
    email: "hariom@gmail.com",
    mobile: "+122222222",
    description: "This is test customer creation",
    source: "visa_tok"
  };
  let response = await updateCustomer(customerObject);
  console.log("Response: ", response);
}

async function deleteCustomer(customerId) {
  let finalResponse = {};
  try {
    let response = await stripe.customers.del(customerId);
    finalResponse.statusCode = 200;
    finalResponse.message = "Success";
    finalResponse.data = response;
  } catch (Ex) {
    finalResponse.statusCode = Ex.statusCode;
    finalResponse.message = "Failure";
    finalResponse.data = Ex.message;
  }
  return finalResponse;
}

async function deleteCustomerFunction() {
  let customerId = "cus_GEMG7fYTWNO8dt";
  let response = await deleteCustomer(customerId);
  console.log("Response: ", response);
}

async function getAccountBalance(accountId) {
  let finalResponse = {};
  try {
    let response = await stripe.balance.retrieve({ stripe_account: accountId });
    finalResponse.statusCode = 200;
    finalResponse.message = "Success";
    finalResponse.data = response;
  } catch (Ex) {
    finalResponse.statusCode = Ex.statusCode;
    finalResponse.message = "Failure";
    finalResponse.data = Ex.message;
  }
  return finalResponse;
}

async function getAccountBalanceFunction() {

  let response = await getAccountBalance("acct_1FwBgcJvTrbPfeon");
  console.log("Response: ", JSON.stringify(response));
}

//createChargeFunction()
//createCustomerFunction();
//updateCustomerFunction();
//deleteCustomerFunction();
//createConnectChargeFunction();
//getAccountBalanceFunction();

module.exports.createCharge = createCharge;
module.exports.createConnectCharge = createConnectCharge;
module.exports.createCustomer = createCustomer;
module.exports.updateCustomer = updateCustomer;
module.exports.deleteCustomer = deleteCustomer;
module.exports.getAccountBalance = getAccountBalance;
