# Broadcast Email Server

This is a broadcast email server built with Node.js. It allows you to send emails to a large number of recipients simultaneously.

## Features

- Send emails to multiple recipients at once
- Customizable email templates
- Support for attachments
- Logging of sent emails
- Error handling and reporting

## end points

formData = {
email:"example@gmail.com",
password:"XYZ",
subject:"example",
body:"example",
csv-file:"clients.csv"

}

- /send-emails/{formData}

## Installation

1. Clone the repository: `git clone https://github.com/codeguyakash/broadmailer.git`
2. Install dependencies: `npm install`

## Configuration

1. Rename the `.env.local` file to `.env`.
2. Open `.env` and update the following settings:
   - `smtpHost`: The hostname of your SMTP server
   - `senderEmail`: The email address from which the emails will be sent
   - `smtpPassword`: Your SMTP server password

## Usage

1. Create a CSV file with the list of recipients. The file should have a column named `email` containing the email addresses.
2. Run the server: `npm start`
3. Send a broadcast email by making a POST request to `http://localhost:3001/send-emails` with the following payload:
   ```json
   {
     "subject": "Hello ✔",
     "text": "Hello world?",
     "html": "<b>Hello world?</b>"
   }
   ```

# More Help

You can ping me on Twitter - <a href="https://twitter.com/codeguyakash">@codeguyakash</a>
