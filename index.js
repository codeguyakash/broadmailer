const cluster = require('node:cluster');
const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const os = require('os');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const csv = require('csv-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const { upload } = require('./middleware/multer');

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
  app.get('/', (_, res) => {
    return res.send({
      numberCPUs: `(${numCPUs})Core CPUs`,
      server: ` ${process.pid}`,
      projectName: 'Email Broadcast',
    });
  });

  app.post('/send-emails', upload.single('file'), (req, res) => {
    const { email, password, subject, body } = req.body;
    const filePath = req?.file?.path;

    if (!(email && password && subject && body)) {
      return res.status(404).send({ message: 'Fields Required' });
    }

    if (!filePath) {
      return res.status(404).send({ message: 'File Required' });
    }

    if (!(req?.file?.mimetype === 'text/csv')) {
      return res.status(404).send({ message: 'Only CSV File Allowed' });
    }

    if (!email?.endsWith('@gmail.com')) {
      return res.status(404).send({ message: 'Only Gmail Allowed' });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: email,
          pass: password,
        },
      });

      const results = [];
      const failed = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const message = {
            from: email,
            to: row?.email,
            subject,
            text: body,
          };
          console.log(`Sending email to: ${row.email}`);
          results.push(
            transporter.sendMail(message).then(
              (info) => ({ to: row?.email, status: 'sent', info }),
              (error) => {
                failed.push({ to: row.email, status: 'failed', error });
              }
            )
          );
        })
        .on('end', async () => {
          await Promise.allSettled(results);
          console.log('Send Process Done...');
          return res.status(200).json({
            message: 'Email sending process completed.',
            total: results.length,
            failed: failed.length,
            success: results.length - failed.length,
            failures: failed,
          });
        });
    } catch (error) {
      console.error('Error sending emails:', error);
      return res.status(500).json(error);
    }
  });

  app.listen(PORT, () => {
    console.log(`🎉🎉 Server PID:- ${process.pid} on http://localhost:${PORT}`);
  });
}
