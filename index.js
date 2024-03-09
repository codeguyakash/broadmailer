dotenv.config();
const express = require("express");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const dotenv = require("dotenv");
const app = express();

const PORT = process.env.PORT || 5432;

app.get("/send-emails", (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASSWORD,
      },
    });
    const message = {
      from: `${process.env.SENDER_EMAIL}`,
      subject: "Say Hello Akash(CTO)!!🐙",
      html: { path: "./email.html" },
    };
    fs.createReadStream("clients.csv")
      .pipe(csv())
      .on("data", (row) => {
        console.log(row.email);
        message.to = row.email;
        transporter.sendMail(message, (error, info) => {
          if (error) {
            console.log(`Error sending email to ${message.to}: ${error}`);
            res.status(500).json({ message: "Something went wrong" });
          } else {
            console.log(`Email sent: ${info.response}`);
            res
              .status(200)
              .send({ message: "Email Sent Success.", info: info.response });
          }
        });
      })
      .on("end", () => {
        console.log("Email Sent Success.");
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
