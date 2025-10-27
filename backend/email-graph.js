// backend/email-graph.js
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch"); // para fetch en Node
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { ClientSecretCredential } = require("@azure/identity");

async function sendContactEmail({ name, email, phone, postCode, message }) {
  // 1. Credenciales desde .env
  const credential = new ClientSecretCredential(
    process.env.MS_TENANT_ID,   
    process.env.MS_CLIENT_ID,   
    process.env.MS_CLIENT_SECRET 
  );

  // 2. Autenticación para Microsoft Graph
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  });

  const client = Client.initWithMiddleware({ authProvider });

 // 3. Enviar correo a la empresa
await client.api(`/users/${process.env.MS_SENDER}/sendMail`).post({
  message: {
    subject: `New contact from ${name}`,
    body: {
      contentType: "HTML",
      content: `
        <div style="font-family: Arial, sans-serif; color:#000000;">
          <h2 style="margin-bottom:10px;">New contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Post Code:</strong> ${postCode || "—"}</p>
          <p><strong>Message:</strong><br/>${message}</p>

          <!-- Footer estilo Figma -->
          <div style="margin-top:40px; background:#F1F1F1; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.12); padding:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif;">
              <tr>
                <!-- Columna izquierda -->
                <td width="50%" valign="top" style="padding:10px;">
                  <img src="https://plum-mex.co.uk/img/LOGO%20PLUM-MEX%20negro%201.png" alt="Plum-Mex" width="160" style="margin-bottom:15px; display:block;">
                  <p style="font-size:16px; font-weight:bold; margin:0;">Get in Touch</p>
                  <p style="margin:5px 0; font-size:14px;">
                    📞 Call us: <a href="tel:01252851109" style="color:#000000; text-decoration:none;">01252 851109</a><br>
                    ✉️ Email: <a href="mailto:info@plum-mex.co.uk" style="color:#000000; text-decoration:none;">info@plum-mex.co.uk</a>
                  </p>
                  <p style="margin:5px 0; font-size:14px;">Follow us:
                    <a href="https://instagram.com/yourprofile" style="margin-left:8px; text-decoration:none;">📷</a>
                    <a href="https://facebook.com/yourprofile" style="margin-left:8px; text-decoration:none;">📘</a>
                  </p>
                </td>

                <!-- Columna derecha -->
                <td width="50%" valign="top" style="padding:10px; background:#ffffff; border:1px solid #D1D1D1; border-radius:15px;">
                  <p style="font-size:16px; font-weight:bold; margin:0 0 10px;">Visit Us</p>
                  <p style="margin:0; font-size:14px;">
                    📍 Unit 12, Finns Business Park, Mill Lane,<br>
                    Crondall, GU10 5RX
                  </p>
                  <p style="margin-top:5px; font-size:13px; color:#333;">
                    (Just off the A287 between Odiham and Farnham,<br>
                    behind the BP petrol station)
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>
      `,
    },
    toRecipients: [
      { emailAddress: { address: process.env.MS_SENDER } },
    ],
  },
  saveToSentItems: true,
});

// 4. Enviar confirmación al cliente
await client.api(`/users/${process.env.MS_SENDER}/sendMail`).post({
  message: {
    subject: `Thanks for contacting Plum-Mex Showroom`,
    body: {
      contentType: "HTML",
      content: `
        <div style="font-family: Arial, sans-serif; color:#000000;">
          <p>Hi ${name},</p>
          <p>We have received your message and will contact you shortly.</p>
          <p><strong>Your message:</strong><br/>${message}</p>
          <p>Thank you for your interest,</p>
          <p><strong>Plum-Mex Showroom</strong></p>

          <!-- Footer estilo Figma -->
          <!-- Footer estilo Figma responsive -->
            <div style="margin-top:40px; background:#F1F1F1; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.12); padding:20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
                    <tr>
                    <td align="center" style="padding:10px;">
                        <!-- Logo -->
                        <img src="https://plum-mex.co.uk/img/LOGO%20PLUM-MEX%20negro%201.png" alt="Plum-Mex" width="160" style="margin-bottom:15px; display:block;">
                    </td>
                    </tr>
                    <tr>
                    <!-- Columna izquierda -->
                        <td style="padding:10px;" align="center">
                            <p style="font-size:16px; font-weight:bold; margin:0;">Get in Touch</p>
                            <p style="margin:5px 0; font-size:14px;">
                            📞 Call us: <a href="tel:01252851109" style="color:#000000; text-decoration:none;">01252 851109</a><br>
                            ✉️ Email: <a href="mailto:info@plum-mex.co.uk" style="color:#000000; text-decoration:none;">info@plum-mex.co.uk</a>
                            </p>
                            <p style="margin:5px 0; font-size:14px;">Follow us:
                            <a href="https://www.instagram.com/plummexshowroom/" target="_blank" style="margin-left:8px; text-decoration:none;">📷</a>
                            <a href="https://www.facebook.com/Plummex" target="_blank" style="margin-left:8px; text-decoration:none;">📘</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                    <!-- Columna derecha (Visit Us) -->
                        <td style="padding:15px; background:#ffffff; border:1px solid #D1D1D1; border-radius:15px;" align="center">
                            <p style="font-size:16px; font-weight:bold; margin:0 0 10px; text-align:center;">Visit Us</p>
                            <p style="margin:0; font-size:14px; text-align:justify;">
                            📍 Unit 12, Finns Business Park, Mill Lane,<br>
                            Crondall, GU10 5RX
                            </p>
                            <p style="margin-top:5px; font-size:13px; color:#333; text-align:justify;">
                            (Just off the A287 between Odiham and Farnham,<br>
                            behind the BP petrol station)
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
      `,
    },
    toRecipients: [
      { emailAddress: { address: email } }, // se lo envías al cliente
    ],
  },
  saveToSentItems: true,
});
}

module.exports = { sendContactEmail };