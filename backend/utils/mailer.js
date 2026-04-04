import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' or configure custom SMTP Host/Port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendNotificationEmail = async (vendorEmail, vendorName, buyerName, buyerEmail, productName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: vendorEmail,
      subject: `New Buy Request for: ${productName}`,
      html: `
        <h3>Hello ${vendorName},</h3>
        <p>You have received a new buy request for your product <strong>${productName}</strong>.</p>
        <h4>Buyer Details:</h4>
        <ul>
          <li><strong>Name:</strong> ${buyerName}</li>
          <li><strong>Email:</strong> ${buyerEmail}</li>
        </ul>
        <p>Please log in to your dashboard to review this request.</p>
        <br/>
        <p>Best regards,<br/>CrackStack Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
