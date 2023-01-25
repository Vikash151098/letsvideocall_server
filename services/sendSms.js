// const config = require("config");
// const winston = require("winston");
// // Download the helper library from https://www.twilio.com/docs/node/install
// // Your Account Sid and Auth Token from twilio.com/console
// // LIVE CREDENTIALS
// const accountSid = config.get("smsc_twilio.sms_client");
// const authToken = config.get("smsc_twilio.sms_client_secret");

// const client = require("twilio")(accountSid, authToken);

// async function sendSms(smsText, mobileNumber) {
//   try {
//     const result = await client.messages.create({
//       body: smsText,
//       from: config.get("smsc_twilio.sms_from_number"),
//       to: mobileNumber,
//     });
//     if (result.sid) {
//       winston.info(
//         `Sending of SMS to ${mobileNumber} success with SID: ${result.sid}`
//       );
//     }
//     return { sid: result.sid };
//   } catch (Ex) {
//     winston.error(
//       `Sending of SMS failed for ${mobileNumber} with errorcode: ${Ex.code}.`
//     );
//     return { code: Ex.code };
//   }
// }

// // Helper function to test
// // async function send() {
// //   const result = await sendSms("This is test sms", "+919872546106");
// //   if (result.sid) console.log("SMS Sent with ID: ", result.sid);
// //   if (result.code) console.log("SMS Sending failed with code: ", result.code);
// // }

// //send();

// module.exports.sendSms = sendSms;
