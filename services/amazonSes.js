const aws = require("aws-sdk");
const config = require("config");
const winston = require("winston");
const { resetPassword, verifyEmail, verifyotp } = require("../services/htmlTemplateFile");
const formatter = require("../services/commonFunctions");
aws.config.update({
  secretAccessKey: "",
  accessKeyId: "",
  region: ""
});

const ses = new aws.SES();

// const params = {
//   Destination: {
//     ToAddresses: ["kanika@zimblecode.com"] // Email address/addresses that you want to send your email
//   },
//   //   ConfigurationSetName: <<ConfigurationSetName>>,
//   Message: {
//     Body: {
//       Html: {
//         // HTML Format of the email
//         Charset: "UTF-8",
//         Data:
//           "<html><body><h1>Hello</h1><p style='color:red'>Sample description</p> <p>Time 1517831318946</p></body></html>"
//       },
//       Text: {
//         Charset: "UTF-8",
//         Data: " Sample description time 1517831318946"
//       }
//     },
//     Subject: {
//       Charset: "UTF-8",
//       Data: "Test email"
//     }
//   },
//   Source: "inder@zimblecode.com"
// };

// const sendEmail = ses.sendEmail(params).promise();

// sendEmail
//   .then(data => {
//     console.log("email submitted to SES", data);
//   })
//   .catch(error => {
//     console.log(error);
//   });

async function sendActivationMail(email, username, ActivationLink) {
  let data = {
    name: username,
    email: email,
    link: ActivationLink
  };
  const temp = formatter(verifyEmail, data);
  const msg = {
    Destination: {
      ToAddresses: [email] // Email address/addresses that you want to send your email
    },
    Message: {
      Body: {
        Html: {
          // HTML Format of the email
          Charset: "UTF-8",
          Data: temp
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: config.get("email_sendgrid.OtpSubject")
      }
    },
    Source: ""
  };
  try {
    const result = await ses.sendEmail(msg).promise();
    winston.info(`Sending of Email to ${email} success with status code: ${result.MessageId}.`);
    return { MessageId: result.MessageId };
  } catch (Ex) {
    winston.error(`Sending of Email failed for ${email} with errorcode: ${Ex.code}: ${Ex.message}.`);
    return { code: Ex.code, message: Ex.message };
  }
}

async function sendOtpMail(email, username, otp) {
  // if (username) text = `Hey ${username}, your OTP is ${otp}.`;
  let data = {
    name: username,
    otp: otp
  };
  const temp = formatter(verifyotp, data);
  const msg = {
    Destination: {
      ToAddresses: [email] // Email address/addresses that you want to send your email
    },
    Message: {
      Body: {
        Html: {
          // HTML Format of the email
          Charset: "UTF-8",
          Data: temp
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: config.get("email_sendgrid.OtpSubject")
      }
    },
    Source: ""
  };
  try {
    const result = await ses.sendEmail(msg).promise();
    winston.info(`Sending of Email to ${email} success with status code: ${result.MessageId}.`);
    return { MessageId: result.MessageId };
  } catch (Ex) {
    winston.error(`Sending of Email failed for ${email} with errorcode: ${Ex.code}: ${Ex.message}.`);
    return { code: Ex.code, message: Ex.message };
  }
}

// Helper function
// async function send() {
//   try {
//     const result = await sendOtpMail("kanika@zimblecode.com", "Kanika", "12234");
//     if (result.MessageId) console.log(`Sending of Email success with mesage Id: ${result.MessageId}`);
//     else if (result.code) console.log(`Sending of Email failed with errorcode: ${result.code}: ${result.message}.`);
//   } catch (Ex) {
//     // console.log(Ex);
//     console.log("Sending of Email failed due to some server error!!!");
//   }
// }

// send();
