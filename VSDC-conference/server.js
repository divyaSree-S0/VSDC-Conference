//  // AJAX request to submit data to server
 
//     const express = require('express');
//     const bodyparser = require('body-parser');
//     const path = require('path');
//     const mongoose = require('mongoose');
//     const nodemailer = require('nodemailer');
//     const app = express();
//     app.use(bodyparser.urlencoded({extended:true}))
//     const port = 3000;              

//     app.set('view engine','ejs');
//     app.use(express.static('public'));

//     app.get("/",(req,res)=>{
//         // res.render('hm.ejs')
//         res.sendFile(path.join(__dirname,'views','index.html'))
//     });
//     app.get("/register",(req,res)=>{res.sendFile(path.join(__dirname,'views','payment.html'))})
//     // app.post("/register",(req,res)=>{res.sendFile(path.join(__dirname,'views','index.html'))})
//     // app.get('/',(req,res)=>res.sendFile(path.join((__dirname,'index.html'))));


//     // Connect to MongoDB
//     mongoose.connect('mongodb://localhost:27017/VSDC', { useNewUrlParser: true});
//     const db = mongoose.connection;
//     db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// // Define schema for registration data
// const registrationSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     phone: String,
//     college: String,
//     registrationType: String,
//     amount: Number,
//     transactionId: String
// });

// const Registration = mongoose.model('Registration', registrationSchema);
    
//     // Middleware
//     app.use(bodyparser.json());
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'demo73717733@gmail.com', // Your email address
//             pass: 'evzlqjgbomeemqsy' // Your email password
//         }
//     });
//     // Route to handle form submission
//     /*app.post('/register', async (req, res) => {
//         try {
//             // Create a new registration instance from the submitted form data
//             const newRegistration = new Registration({
//                 name: req.body.name,
//                 email: req.body.mail,
//                 phone: req.body.phno,
//                 college: req.body.colname,
//                 registrationType: req.body.registrationType,
//                 amount: parseInt(req.body.amount),
//                 transactionId: req.body['upi-id']
//             });
    
//             // Save the registration data to MongoDB
//             await newRegistration.save();
    
//             // Send a success response back to the client
//             res.send("Registration successful Confirmation mail will be sent to your Mail Id in some time , Thank you");
//             res.sendFile(path.join(__dirname,'views','index.html'))
//         } catch (error) {
//             // If an error occurs, send a 500 status code and error message
//             console.error('Error processing registration:', error);
//             res.status(500).send('Error processing registration');
//         }
//     });*/

//     //with email
//     app.post('/register', async (req, res) => {
//         alert("Registration successful. Confirmation mail will be sent to your Mail Id in some time. Thank you.");
//         try {
//             // Create a new registration instance from the submitted form data
//             const newRegistration = new Registration({
//                 name: req.body.name,
//                 email: req.body.mail,
//                 phone: req.body.phno,
//                 college: req.body.colname,
//                 registrationType: req.body.registrationType,
//                 amount: parseInt(req.body.amount),
//                 transactionId: req.body['upi-id']
//             });
    
//             // Save the registration data to MongoDB
//             await newRegistration.save();
    
//             // Send confirmation email
//             const mailOptions = {
//                 from: 'demo73717733@gmail.com', // Your email address
//                 to: req.body.mail, // Recipient's email address from the form
//                 subject: 'Registration Confirmation',
//                 text: 'Thank you for registering! Your registration has been successfully completed.'
//             };
    
//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error('Error sending email:', error);
//                 } else {
//                     console.log('Email sent:', info.response);
//                 }
//             });
    
//             // Send a success response back to the client
//             //res.send("Registration successful. Confirmation mail will be sent to your Mail Id in some time. Thank you.");
//             res.sendFile(path.join(__dirname,'views','index.html'))
//         } catch (error) {
//             // If an error occurs, send a 500 status code and error message
//             console.error('Error processing registration:', error);
//             res.status(500).send('Error processing registration');
//         }
//     });


       
    
//     // Start server
//     app.listen(port, () => {
//         console.log(`Server is running on http://localhost:${port}`);
//     });
    


// WITH RANDOM GEN UID


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Importing dotenv
require('dotenv').config();

// Importing credentials from the configuration file
const { USER, PASSWORD } = require('./config');


const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'payment.html'));
});

mongoose.connect('mongodb://localhost:27017/VSDC', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    college: String,
    registrationType: String,
    amount: Number,
    transactionId: String,
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
            from: USER,
            // from: 'vsdchomrugconference2024@gmail.com',
            to: req.body.mail,
            subject: 'Registration Confirmation',
            text: `Thank you for registering! Your registration has been successfully completed. Your UID is ${newRegistration.uid}.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).send('Error processing registration');
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER,
        pass: PASSWORD
        // user: 'vsdchomrugconference2024@gmail.com',
        // pass: 'roeuogkrqzfvaucu'
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



//END OF UID

