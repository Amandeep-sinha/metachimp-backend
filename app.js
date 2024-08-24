// require("./db");
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());


const nodemailer = require("nodemailer");

const footerTemplate = `
    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; color: #666;">
        <p>&copy; {{year}} {{brand}}. All rights reserved.</p>
        <p>Visit us at <a href="http://www.yourbrandwebsite.com">{{brand}}</a></p>
    </div>
`;

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILER,
        pass: process.env.MAIL_PASSWORD,
    },
});

app.post('/send-emails', async (req, res) => {
    const { emails, subject, content } = req.body;

    const currentYear = new Date().getFullYear();
    const footer = footerTemplate
        .replace(/{{year}}/g, currentYear)
        // .replace(/{{brand}}/g, brand);

    // Append the footer to the user-provided content
    const emailContent = content + footer;

    
    if (!Array.isArray(emails) || !subject || !content) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    
    try {
        for (const email of emails) {
        await transporter.sendMail({
            from: 'your-email@gmail.com', // Sender address
          to: email, // List of recipients
          subject: subject, // Subject line
          html: emailContent // Plain text body
        });
    }
    res.status(200).json({ message: 'Emails sent successfully' });
} catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Error sending emails' });
}
});


const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT is not set
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("You are using Mail Chimp");
});