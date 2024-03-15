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
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const numCPUs = os.cpus().length;

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
    console.log(`🎉🎉 Server PID:- ${process.pid} on http://localhost:${PORT}`);
  });
}
