// backend/routes/contact.js
const express = require("express");
require("dotenv").config();
const { sendContactEmail } = require("../email-graph");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Enviar correo con Graph API
    await sendContactEmail({ name, email, phone, message });

    res.status(200).json({ message: "Message sent successfully via Microsoft Graph." });
  } catch (error) {
    console.error("Error sending email via Graph:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;