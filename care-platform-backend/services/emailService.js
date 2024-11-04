require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (mailOptions) => {
  try {
    const { data } = await resend.emails.send({
      from: mailOptions.from,
      to: [mailOptions.to],
      subject: mailOptions.subject,
      html: mailOptions.html,
    });
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; // Throw error to be caught by the caller
  }
};

module.exports = sendEmail;
