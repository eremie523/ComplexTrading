const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

module.exports.registerMail = async (req, res) => {

  const {UserEmail, username, text, subject } = req.body
  let config = {
    service: "gmail",
    auth: {
      user: "davidderedx2@gmail.com",
      pass: "whuigkmpmlljqayo",
    },
  };

  let transporter = nodemailer.createTransport(config);

  const MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js",
    },
  });

  let response = {
    body: {
      name: username||  "Complex Trading",
      intro: text || "Welcome to Complex Trading! Earn more from Trading",
      outro:
        "Need help, or have questions? Just reply to this email; we'd love to help.",
    },
  };

let mail = MailGenerator.generate(response)

const message = {
      from: 'davidderedx2@gmail.om', // Use your authenticated email address here
      to: UserEmail,
      subject: subject || 'Sign Up Successful',
      html: mail,
    };

    transporter.sendMail(message).then(() => {
      return res.status(201).json({message: "You should recive a message"})
    }).catch((error) => {
      return res.status(500).json({error})
    })

  }
  

// const nodeConfig = {
//   host: 'smtp.ethereal.email',
//   port: 587,
//   auth: {
//     user: "Daniel",
//     pass: '3zCagrenRvu8HC3rES',
//   },
// };

// const transporter = nodemailer.createTransport(nodeConfig);

// const MailGenerator = new Mailgen({
//   theme: 'default',
//   product: {
//     name: 'Mailgen',
//     link: 'https://mailgen.js',
//   },
// });

// module.exports.registerMail = async (req, res) => {
//   const { username, UserEmail, text, subject } = req.body;

//   // Body of the email
//   const email = {
//     body: {
//       name: username,
//       intro: text || 'Welcome to Complex Trading! Earn more from Trading',
//       outro: "Need help, or have questions? Just reply to this email; we'd love to help.",
//     },
//   };

//   const emailBody = MailGenerator.generate(email);

//   const message = {
//     from: 'madelynn.dickens@ethereal.email', // Use your authenticated email address here
//     to: UserEmail,
//     subject: subject || 'Sign Up Successful',
//     html: emailBody,
//   };

//   try {
//     await transporter.sendMail(message);
//     res.status(200).json({ message: 'Mail sent successfully' });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ message: 'Message failed' });
//   }
// };
