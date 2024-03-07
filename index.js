require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 5432;

app.get("/send-emails", (req, res) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASSWORD,
    },
  });
  async function main() {
    const info = await transporter.sendMail({
      from: `Aakash!!👻 ${senderEmail}`,
      to: "example@example.com",
      subject: "Hello ✔",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });

    console.log("Message sent: %s", info.messageId);
  }

  const message = {
    from: process.env.SENDER_EMAIL,
    subject: "OKK 🙂🙂",
    text: "Happy Hacking!! @codeguyakash",
  };

  fs.createReadStream("clients.csv")
    .pipe(csv())
    .on("data", (row) => {
      console.log(row.email);
      message.to = row.email;
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log(`Error sending email to ${message.to}: ${error}`);
        } else {
          console.log(`Email sent to ${message.to}: ${info.response}`);
        }
      });
    })
    .on("end", () => {
      console.log("Email Sent Success.");
      res.status(200).send({ message: "Email Sent Success." });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
