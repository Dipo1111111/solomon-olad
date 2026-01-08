const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File path for subscribers
const CSV_FILE = path.join(__dirname, 'subscribers.csv');

// Ensure CSV file exists with headers
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'Email,Date\n');
}

// Nodemailer Transporter Configuration
// IMPORTANT: You must replace these placeholders with your actual details.
// For Gmail, use an App Password: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'igbojuwooladipupo81@gmail.com', // REPLACE THIS
        pass: 'YOUR_APP_PASSWORD'     // REPLACE THIS
    }
});

// Subscribe Endpoint
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const timestamp = new Date().toISOString();
    const csvLine = `"${email}","${timestamp}"\n`;

    try {
        // 1. Save to CSV
        fs.appendFileSync(CSV_FILE, csvLine);

        // 2. Send Auto-Response Email
        const mailOptions = {
            from: '"Solomon Olad" <YOUR_EMAIL@gmail.com>', // REPLACE with your email
            to: email,
            subject: 'Your Trading Journal Template (Download Link)',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #000;">Here is your Trading Journal.</h2>
                    <p>Thanks for requesting the journal. You can access the Notion template using the link below:</p>
                    
                    <p style="margin: 30px 0;">
                        <a href="https://www.notion.so/TET-Trading-Journal-2-0-2a999f30d11580bba32ef59f245ed692?source=copy_link" 
                           style="background-color: #0A8BC9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                           Open Notion Template
                        </a>
                    </p>

                    <p><strong>To use this:</strong></p>
                    <ol>
                        <li>Click the link above.</li>
                        <li>Click "Duplicate" in the top right corner of Notion to modify it for yourself.</li>
                    </ol>
                    
                    <p>Happy Trading,<br>Solomon</p>
                </div>
            `
        };

        // Send email (async, but we won't block the response on it failing to keep UI fast)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                // We typically still consider this a "success" from the frontend perspective 
                // if the data was saved, but strictly speaking it's a partial failure.
            } else {
                console.log('Email sent:', info.response);
            }
        });

        console.log(`New subscriber saved: ${email}`);
        return res.json({ success: true, message: 'Subscribed successfully' });

    } catch (err) {
        console.error('Error processing subscription:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
