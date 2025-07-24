const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 1. Enviar a tu correo
    await transporter.sendMail({
      from: `"Plum-Mex Showroom" <${process.env.SMTP_USER}>`,
      to: "go.yellowsquare@gmail.com", // Cambiar esto cuando finalizen las pruebas por to: "  info@plum-mex.co.uk",
      subject: "Nuevo mensaje desde el formulario de contacto",
      html: `
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Teléfono:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mensaje:</strong> ${message}</p>
  `,
    });

    // 2. Enviar confirmación al cliente
    await transporter.sendMail({
      from: `"Plum-Mex Showroom" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Gracias por contactar con Plum-Mex Showroom",
      html: `
    <p>Hola ${name},</p>
    <p>Hemos recibido tu mensaje y te contactaremos lo antes posible.</p>
    <p><strong>Tu mensaje:</strong> ${message}</p>
    <p>Gracias por tu interés,</p>
    <p><strong>Plum-Mex Showroom</strong></p>
  `,
    });

    // await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;
