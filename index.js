const cluster = require("node:cluster");
const express = require("express");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const os = require("os");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const csv = require("csv-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const { upload } = require("./middleware/multer");

dotenv.config();
const app = express();
const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5432;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------OAuth2--------
const myOAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
// const ACCESS_TOKEN = myOAuth2Client.getAccessToken();
// console.log("first")

myOAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
  },
});

app.post("/sendemail", function (req, res) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: "codeguyakash@techlogs.tech",
    subject: "Hii OAuth2 from Google-Nodemailer",
    html: "<p>You have received this email using nodemailer, you are welcome ;)</p>",
  };
  console.log(mailOptions);
  transport.sendMail(mailOptions, function (err, result) {
    if (err) {
      console.log(err);
      res.send({
        message: err,
      });
    } else {
      console.log(result);
      transport.close();
      res.send({
        message: "Email has been sent: check your inbox!",
        result,
      });
    }
  });
});

// ---------------------OAuth2--------
app.listen(PORT, () => {
  console.log(`🎉🎉 Server: http://localhost:${PORT}`);
});
return;

app.get("/", (_, res) => {
  return res.send({
    numberCPUs: `(${numCPUs})Core CPUs`,
    projectName: "Email Broadcast",
=======
if (cluster.isPrimary) {
  console.log(`Primary Server PID:- ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  const PORT = process.env.PORT || 5432;
  app.get("/", (_, res) => {
    return res.send({
      numberCPUs: `(${numCPUs})Core CPUs`,
      server: ` ${process.pid}`,
      projectName: "Email Broadcast",
    });

  });

app.post("/send-emails", upload.single("file"), (req, res) => {
  const { email, password, subject, body } = req.body;
  const file = req?.file;
  const filePath = req?.file?.path;
  if (emailCount >= 10) return res.send({ response: "Limit End" });

  if (!email && !password && !subject && !body) {
    return res.status(404).send({ message: "Fields Required" });
  }
  let domain = email.match(/@gmail\.com$/);
  if (!filePath) {
    return res.status(404).send({ message: "File Required" });
  }
  if (!(file?.mimetype === "text/csv")) {
    return res.status(404).send({ message: "Only CSV File Allowed" });
  }
  if (!domain) {
    return res.status(404).send({ message: "Only Gmail Allowed" });
  }
  // fs.readFile("uploads/clients.csv", "utf8", (err, data) => {
  //   if (err) {
  //     console.error(err);
  //     console.log("step-1-done");
  //     return;
  //   }
  //   const updatedContent = content + data;
  //   fs.writeFile("uploads/clients.csv", updatedContent, (error, result) => {
  //     error ? console.log(error) : console.log(result);
  //   });
  //   console.log("step-2-done");
  //   return;
  // });
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
        message.to = row.email;
        transporter.sendMail(message, (error, info) => {
          try {
            if (error) {
              res.status(error?.responseCode).json(error);
            } else {
              console.log(`Email sent: ${info.response}`);
              res
                .status(201)
                .send({ message: "Email Sent Success.", info: info.response });

  app.post("/send-emails", upload.single("file"), (req, res) => {
    const { email, password, subject, body } = req.body;
    const file = req?.file;
    const filePath = req?.file?.path;

    if (!(email && password && subject && body)) {
      return res.status(404).send({ message: "Fields Required" });
    }
    let domain = email?.match(/@gmail\.com$/);
    if (!filePath) {
      return res.status(404).send({ message: "File Required" });
    }
    if (!(file?.mimetype === "text/csv")) {
      return res.status(404).send({ message: "only CSV File Allowed" });
    }
    if (!domain) {
      return res.status(404).send({ message: "Only Gmail Allowed" });
    }

    // fs.readFile("uploads/clients.csv", "utf8", (err, data) => {
    //   if (err) {
    //     console.error(err);
    //     console.log("step-1-done");
    //     return;
    //   }
    //   const updatedContent = content + data;
    //   fs.writeFile("uploads/clients.csv", updatedContent, (error, result) => {
    //     error ? console.log(error) : console.log(result);
    //   });
    //   console.log("step-2-done");
    //   return;
    // });
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
          message.to = row.email;
          transporter.sendMail(message, (error, info) => {
            try {
              if (error) {
                res.status(error?.responseCode).json(error);
              } else {
                console.log(`Email sent: ${info}`);
                res
                  .status(202)
                  .send({ message: "Email Sent Success.", info: info });
              }
            } catch (error) {
              res.status(500).json(error);

            }
          });
        })
        .on("end", () => {
          console.log("Send Process Done...");
        });
    } catch (error) {
      res.status(500).json(error);
    }
  });


app.listen(PORT, () => {
  console.log(`Running - http://localhost:${PORT}`);
});
=======
  app.listen(PORT, () => {
    console.log(`🎉🎉 Server PID:- ${process.pid} on http://localhost:${PORT}`);
  });
}
