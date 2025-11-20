import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Crea el transporter de nodemailer con la configuración de Mailtrap
 * @returns {nodemailer.Transporter} Transporter configurado
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Envía un correo de recuperación de contraseña
 * @param {string} email - Email del destinatario
 * @param {string} token - Token de recuperación
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendPasswordRecoveryEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    
    // Construir la URL de recuperación
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4173';
    const recoveryUrl = `${frontendUrl}/recovery-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@ridery.com',
      to: email,
      subject: 'Recuperación de Contraseña - Ridery',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3bd4ae 0%, #2a9d8f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Ridery</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2a9d8f; margin-top: 0;">Recuperación de Contraseña</h2>
            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${recoveryUrl}" 
                 style="background-color: #3bd4ae; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Si no solicitaste este cambio, puedes ignorar este correo. El enlace expirará en 1 hora.
            </p>
            <p style="font-size: 12px; color: #666;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${recoveryUrl}" style="color: #3bd4ae; word-break: break-all;">${recoveryUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Recuperación de Contraseña - Ridery
        
        Hemos recibido una solicitud para restablecer tu contraseña.
        
        Haz clic en el siguiente enlace para crear una nueva contraseña:
        ${recoveryUrl}
        
        Si no solicitaste este cambio, puedes ignorar este correo. El enlace expirará en 1 hora.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    throw new Error('Error al enviar el correo de recuperación');
  }
};

