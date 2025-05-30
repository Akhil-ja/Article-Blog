import nodemailer from "nodemailer";

function generateOTP() {
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  return otp;
}

const sendOTP = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
  });

  const subject = "Authentication OTP for Article Feeds";
  const text = `Your OTP for authentication on Article Feeds is: ${otp}`;

  const mailOptions = {
    from: process.env.MAIL,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

export { sendOTP, generateOTP };
