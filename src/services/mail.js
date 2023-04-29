const  nodemailer = require("nodemailer")
const logger = require("../utils/logger");

const mail = ""
// create reusable transporter object using the default SMTP transport
const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: mail,
    pass: "",
  },
})


const sendMail = async (receiver, secretCode, username, callback) => {
  try {
    const mailSubject = "Eshtry email verification"
    const mailDetails = {
      from: mail,
      to: receiver,
      subject: mailSubject, 
      html: `<html>
      <body>
      <a href="http:localhost:3000?verify?secretCode=${secretCode}&username=${username}">click here to verify</a>
      </body>
     </html>`
      }
    const info = await transport.sendMail(mailDetails)
    callback(info);
  } catch (error) {
    logger.error(error);
  } 
};



module.exports = sendMail

