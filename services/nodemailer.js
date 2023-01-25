"use strict";
const nodemailer = require("nodemailer");
const winston = require("winston");

// async..await is not allowed in global scope, must use a wrapper

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();

// create reusable transporter object using the default SMTP transport

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'noreply.letsvideocall@gmail.com', // generated ethereal user
        pass: 'tihesttvzugbfkbj', // generated ethereal password
    },
});


async function sendOtpMail(to_email, otp) {

    
    
    // send mail with defined transport object
    let msg = transporter.sendMail({
        // from: '"Fred Foo 👻" <foo@example.com>', // sender address
        from: '"LetsVideocall Team"<noreply.letsvideocall@gmail.com>', // sender address

        // to: "bar@example.com, baz@example.com", // list of receivers
        to: `${to_email}`, // list of receivers

        subject: "OTP for new User Registration ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>OTP for new User Registration ${otp} </b>`, // html body
    }).then(res => {

        console.log("Message sent: %s", res.messageId);
        return res;
    }).catch(err => {
        // console.error("Message sent failed err", err)
        winston.error(`Sending of Email failed for ${to_email} with errorcode: ${err.code}: ${err}.`);
        return err;
    });

    return msg

}


// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

// Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

module.exports.sendOtpMail = sendOtpMail;