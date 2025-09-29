// backend/email-graph.js
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch"); // para fetch en Node
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { ClientSecretCredential } = require("@azure/identity");

async function sendContactEmail({ name, email, phone, message }) {
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
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        `,
      },
      toRecipients: [
        { emailAddress: { address: process.env.MS_SENDER } },
      ],
    },
  });

  // 4. Enviar confirmación al cliente
  await client.api(`/users/${process.env.MS_SENDER}/sendMail`).post({
    message: {
      subject: `Thanks for contacting Plum-Mex Showroom`,
      body: {
        contentType: "HTML",
        content: `
          <p>Hi ${name},</p>
          <p>We have received your message and will contact you shortly.</p>
          <p><strong>Your message:</strong><br/>${message}</p>
          <p>Thank you for your interest,</p>
          <p><strong>Plum-Mex Showroom</strong></p>
        `,
      },
      toRecipients: [
        { emailAddress: { address: email } }, // se lo envías al cliente
      ],
    },
  });
}

module.exports = { sendContactEmail };