const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Import nodemailer
const twilio = require('twilio'); // Import Twilio

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '2005', // Your MySQL password
    database: 'Restaurant' // Your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anonymous.99.unanimous@gmail.com', // Your Gmail address
        pass: '.99.unanimous', // Your Gmail password or app password
    },
});

// Twilio configuration
const accountSid = 'AC40a6dfbfe33ef5ffdaf4a1b15e51313f'; // Your Twilio Account SID
const authToken = '3b15b6375c6e4053298e9259d9a4ed37'; // Your Twilio Auth Token
const twilioClient = twilio(accountSid, authToken);
const twilioNumber = '+13072094820'; // Your Twilio SMS number

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM Login WHERE username = ? AND password = ?';

    db.query(sql, [username, password], (error, results) => {
        if (error) {
            console.error('Error fetching data:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Signup endpoint
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    const checkUserSql = 'SELECT * FROM Login WHERE username = ?';
    db.query(checkUserSql, [username], (error, results) => {
        if (error) {
            console.error('Error checking username:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length > 0) {
            return res.json({ success: false, message: 'Username already exists' });
        }

        const insertUserSql = 'INSERT INTO Login (username, password) VALUES (?, ?)';
        db.query(insertUserSql, [username, password], (error, results) => {
            if (error) {
                console.error('Error inserting new user:', error);
                return res.status(500).json({ success: false, message: 'Server error during sign up' });
            }
            res.json({ success: true, message: 'Sign up successful' });
        });
    });
});

// Endpoint for saving user data (form submission from user.html)
app.post('/submit', (req, res) => {
    const { name, phone, email, address, zipcode, preference, notes } = req.body;
    const sql = 'INSERT INTO users (name, phone, email, address, zipcode, preference, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [name, phone, email, address, zipcode, preference, notes], (error, results) => {
        if (error) {
            console.error('Error inserting user data:', error);
            return res.status(500).json({ message: 'Server error during data submission' });
        }
        res.json({ message: 'Data saved successfully!' });
    });
});

// Endpoint for saving cart items
app.post('/save-cart', (req, res) => {
    const { userId, cart } = req.body; // Expecting userId and cart array

    // Check if cart is not empty
    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    // Iterate over the cart and insert each item
    const promises = cart.map(item => {
        const sql = 'INSERT INTO cart_items (user_id, item_name, item_price, quantity) VALUES (?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            db.query(sql, [userId, item.name, item.price, item.quantity], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });

    // Resolve all promises
    Promise.all(promises)
        .then(() => {
            res.json({ message: 'Cart saved successfully!' });
        })
        .catch(error => {
            console.error('Error saving cart:', error);
            res.status(500).json({ message: 'Error saving cart' });
        });
});

// Fetch customer data
app.get('/users', (req, res) => {
    const sql = 'SELECT name, phone, email, address, zipcode, preference, notes, submission_time FROM users';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({ message: 'Error fetching user data' });
        }
        res.json(results);
    });
});

// Fetch reservations data
app.get('/reservations', (req, res) => {
    const sql = 'SELECT name, phone, email, reservation_date, reservation_time, guests, table_name, created_at FROM reservations';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching reservations data:', error);
            return res.status(500).json({ message: 'Error fetching reservations data' });
        }
        res.json(results);
    });
});

// Reservation endpoint
app.post('/reserve-table', (req, res) => {
    const { name, phone, email, reservation_date, reservation_time, guests, table_name } = req.body;

    // Define confirmation message
    const confirmationMessage = `Dear Customer,\n\nThank you for choosing Grand Luxe Interface! We are thrilled to confirm your reservation with us.\n\nWe can't wait to welcome you!\n\nThe details of your reservation are as follows:\n\nReservation Date: ${reservation_date}\nReservation Time: ${reservation_time}\nGuests: ${guests}\nTable: ${table_name}\n\nIf you have any special requests or require further assistance, please do not hesitate to reach out.\n\nBest regards,\nThe Grand Luxe Interface Team`;

    const sql = 'INSERT INTO reservations (name, phone, email, reservation_date, reservation_time, guests, table_name) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, phone, email, reservation_date, reservation_time, guests, table_name], (err, result) => {
        if (err) {
            console.error('Error saving reservation:', err);
            return res.status(500).json({ message: 'Error saving reservation.' });
        }

        // Send confirmation email
        sendConfirmationEmail(email, confirmationMessage);

        // Send SMS message
        sendSMS(phone, confirmationMessage);

        res.json({ message: 'Reservation successful!' });
    });
});


// Function to send confirmation email
function sendConfirmationEmail(customerEmail, reservationDetails) {
    const mailOptions = {
        from: 'grandluxeinterface@gmail.com',
        to: customerEmail,
        subject: 'Reservation Confirmation',
        text: reservationDetails
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Function to send SMS message
function sendSMS(phone, reservationDetails) {
    const message = reservationDetails;

    twilioClient.messages.create({
        from: twilioNumber,
        to: phone,
        body: message,
    })
    .then(message => console.log('SMS sent: ' + message.sid))
    .catch(error => console.error('Error sending SMS: ', error));
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
