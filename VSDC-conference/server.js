require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'payment.html'));
});

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    college: String,
    registrationType: String,
    amount: Number,
    transactionId: {
        type: String,
        unique: true
    },
    uid: {
        type: String,
        unique: true // Ensure uniqueness
    }
});

registrationSchema.pre('save', async function(next) {
    const generateUID = () => {
        const min = 1000;
        const max = 9999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    if (!this.uid) {
        let uid = generateUID().toString();
        try {
            // Check if UID already exists
            let existingRegistration = await Registration.findOne({ uid });
            while (existingRegistration) {
                uid = generateUID().toString();
                existingRegistration = await Registration.findOne({ uid });
            }
            this.uid = uid;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const Registration = mongoose.model('Registration', registrationSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});

app.post('/register', async (req, res) => {
    try {
        const newRegistration = new Registration({
            name: req.body.name,
            email: req.body.mail,
            phone: req.body.phno,
            college: req.body.colname,
            registrationType: req.body.registrationType,
            amount: parseInt(req.body.amount),
            transactionId: req.body['upi-id']
        });

        await newRegistration.save();

        const mailOptions = {
            from: process.env.USER,
            to: req.body.mail,
            subject: 'Registration Confirmation',
            text: `
                We are pleased to confirm your registration for the Karnataka State OMR UG Conference-2024, themed "Emerging Trends in Therapeutics," 
                which will be hosted by VS Dental College on April 5th and 6th, 2024.
                
                Your participation in this conference will contribute significantly to the exchange of knowledge and the advancement of the field. 
                We are confident that the sessions and discussions lined up will provide valuable insights and networking opportunities.
                
                Your unique ID for the conference is ${newRegistration.uid}. Please keep this ID handy for any future reference or communication related to the event.
                
                Should you require any further assistance or have any inquiries, please do not hesitate to contact us. 
                You can reach out to Dr.Jahnavi M.S at 9448112800, Dr. Praveen Jain at 8904726546, or  Dr. Dishanth C at 9113999625. 
                We are here to ensure that your experience at the conference is seamless and rewarding.
                
                We eagerly anticipate your presence and active participation at the Karnataka State OMR UG Conference-2024.
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        // Registration successful, send response
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.transactionId === 1) {
            // Duplicate transactionId error
            return res.status(400).send(`
                <script>
                    alert("Transaction ID already used for registration. Please check your email for confirmation. For further details, Contact Us ");
                    window.location.href = '/';
                </script>
            `);
        } else {
            // Other errors
            console.error('Error processing registration:', error);
            res.status(500).send('Error processing registration');
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:3000`);
});


// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const path = require('path');
// const mongoose = require('mongoose');
// const nodemailer = require('nodemailer');
// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));

// const port = 3000;
// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// app.get("/register", (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'payment.html'));
// });

// mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// const registrationSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     phone: String,
//     college: String,
//     registrationType: String,
//     amount: Number,
//     transactionId: String,
//     uid: {
//         type: String,
//         unique: true // Ensure uniqueness
//     }
// });

// registrationSchema.pre('save', async function(next) {
//     const generateUID = () => {
//         const min = 1000;
//         const max = 9999;
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//     };

//     if (!this.uid) {
//         let uid = generateUID().toString();
//         try {
//             // Check if UID already exists
//             let existingRegistration = await Registration.findOne({ uid });
//             while (existingRegistration) {
//                 uid = generateUID().toString();
//                 existingRegistration = await Registration.findOne({ uid });
//             }
//             this.uid = uid;
//             next();
//         } catch (error) {
//             next(error);
//         }
//     } else {
//         next();
//     }
// });

// const Registration = mongoose.model('Registration', registrationSchema);

// app.post('/register', async (req, res) => {
//     try {
//         const newRegistration = new Registration({
//             name: req.body.name,
//             email: req.body.mail,
//             phone: req.body.phno,
//             college: req.body.colname,
//             registrationType: req.body.registrationType,
//             amount: parseInt(req.body.amount),
//             transactionId: req.body['upi-id']
//         });

//         await newRegistration.save();

//         const mailOptions = {
//             // from: 'vsdchomrugconference2024@gmail.com',
//             from: process.env.USER,
//             to: req.body.mail,
//             subject: 'Registration Confirmation',
//             text: `
//                 We are pleased to confirm your registration for the Karnataka State OMR UG Conference-2024, themed "Emerging Trends in Therapeutics," 
//                 which will be hosted by VS Dental College on April 5th and 6th, 2024.
                
//                 Your participation in this conference will contribute significantly to the exchange of knowledge and the advancement of the field. 
//                 We are confident that the sessions and discussions lined up will provide valuable insights and networking opportunities.
                
//                 Your unique ID for the conference is ${newRegistration.uid}. Please keep this ID handy for any future reference or communication related to the event.
                
//                 Should you require any further assistance or have any inquiries, please do not hesitate to contact us. 
//                 You can reach out to Dr.Jahnavi M.S at 9448112800, Dr. Praveen Jain at 8904726546, or  Dr. Dishanth C at 9113999625. 
//                 We are here to ensure that your experience at the conference is seamless and rewarding.
                
//                 We eagerly anticipate your presence and active participation at the Karnataka State OMR UG Conference-2024.
//             `
//         };
        

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//             } else {
//                 console.log('Email sent:', info.response);
//             }
//         });

//         res.sendFile(path.join(__dirname, 'views', 'index.html'));
//     } catch (error) {
//         console.error('Error processing registration:', error);
//         res.status(500).send('Error processing registration');
//     }
// });

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         // user: 'vsdchomrugconference2024@gmail.com',
//         // pass: 'roeuogkrqzfvaucu'
//         user:process.env.USER,
//         pass:process.env.PASS
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });



// //END OF UID