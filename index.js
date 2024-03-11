const express = require("express");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const dotenv = require("dotenv");
const os = require("os");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { upload } = require("./middleware/multer");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const numCPUs = os.cpus().length;

const PORT = process.env.PORT || 5432;
// ----------------get route-----------------------------------
app.get("/", (_, res) => {
  return res.send({
    numberCPUs: `(${numCPUs})Core CPUs`,
    projectName: "Email Broadcast",
  });
});

// ----------------post route-----------------------------------
app.get("count", (req, res) => {
  console.log();
  return res.send("Ok");
});

let emailCount = 0;
app.post("/send-emails", upload.single("file"), (req, res) => {
  const { email, password, subject, body } = req.body;
  const cookies = req.cookies.userEmailId;
  if (emailCount >= 10) return res.send({ response: "limit end" });

  // console.log(cookies);
  console.log(req.body);
  if (cookies === email) {
    return res.status(400).send({ message: "Email cookie already exists" });
    emailCount++;
  }

  console.log(emailCount);
  let domain = email.match(/@gmail\.com$/);

  if ([email, password, subject, body].some((field) => field?.trim() === "")) {
    return res.status(404).send({ message: "Fields Required" });
  }

  if (domain === null) {
    return res.status(404).send({ message: "Only Gmail Allowed" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: `${email}`,
        pass: `${password}`,
      },
    });
    const message = {
      from: `${email}`,
      subject: `${subject}`,
      text: `${body}`,
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
              .status(201)
              .send({ message: "Email Sent Success.", info: info.response });
            res.cookie("myCookie", "cookieValue").send("Cookie is set");
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
