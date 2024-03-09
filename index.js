const express = require("express");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const dotenv = require("dotenv");
const { upload } = require("./middleware/multer");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5432;

app.get("/send-emails", upload.single("csv-file"), (req, res) => {
  const { email, password, subject, body } = req.body;

  let domain = email.match(/@gmail\.com$/);
  console.log(domain);
  if (!domain[0] === "@gmail.com") return;
  // return;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: `${email}`,
        pass: `${password}`,
      },
    });
    const message = {
      from: `${process.env.SENDER_EMAIL}`,
      subject: "Say Hello Akash(CTO)!!🐙",
      html: { path: "./email.html" },
    };
    fs.createReadStream("uploads/clients.csv")
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
