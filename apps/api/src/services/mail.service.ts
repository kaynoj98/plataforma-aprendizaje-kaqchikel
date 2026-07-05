import nodemailer from "nodemailer";

import { env } from "../config/env.js";

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const transporter =
  env.MAIL_MODE === "smtp"
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,

        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      })
    : null;

async function sendMail(input: SendMailInput): Promise<void> {
  if (env.MAIL_MODE === "log") {
    console.log("\n========================================");
    console.log("CORREO SIMULADO");
    console.log(`Para: ${input.to}`);
    console.log(`Asunto: ${input.subject}`);
    console.log(input.text);
    console.log("========================================\n");

    return;
  }

  if (!transporter) {
    throw new Error("El transporte SMTP no está configurado.");
  }

  await transporter.sendMail({
    from: {
      name: env.SMTP_FROM_NAME,
      address: env.SMTP_FROM_EMAIL,
    },

    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export const mailService = {
  async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl =
      `${env.APP_URL}/confirmar-correo` + `?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: email,
      subject: "Confirma tu cuenta en la Plataforma Kaqchikel",

      text: [
        "Confirma tu cuenta ingresando al siguiente enlace:",
        verificationUrl,
        "",
        `El enlace será válido durante ${env.EMAIL_VERIFICATION_TOKEN_HOURS} horas.`,
        "",
        "Si no solicitaste esta cuenta, puedes ignorar el mensaje.",
      ].join("\n"),

      html: `
        <h1>Confirma tu cuenta</h1>

        <p>
          Para activar tu cuenta en la Plataforma Kaqchikel,
          selecciona el siguiente enlace:
        </p>

        <p>
          <a href="${verificationUrl}">
            Confirmar mi cuenta
          </a>
        </p>

        <p>
          El enlace será válido durante
          ${env.EMAIL_VERIFICATION_TOKEN_HOURS} horas.
        </p>

        <p>
          Si no solicitaste esta cuenta, puedes ignorar
          este mensaje.
        </p>
      `,
    });
  },

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl =
      `${env.APP_URL}/restablecer-contrasena` +
      `?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: email,
      subject: "Restablece tu contraseña de la Plataforma Kaqchikel",

      text: [
        "Puedes restablecer tu contraseña utilizando el siguiente enlace:",
        resetUrl,
        "",
        `El enlace será válido durante ${env.PASSWORD_RESET_TOKEN_MINUTES} minutos.`,
        "",
        "Si no solicitaste el cambio, puedes ignorar este mensaje.",
      ].join("\n"),

      html: `
        <h1>Restablecer contraseña</h1>

        <p>
          Se recibió una solicitud para cambiar la contraseña
          de tu cuenta.
        </p>

        <p>
          <a href="${resetUrl}">
            Restablecer mi contraseña
          </a>
        </p>

        <p>
          El enlace será válido durante
          ${env.PASSWORD_RESET_TOKEN_MINUTES} minutos.
        </p>

        <p>
          Si no realizaste esta solicitud, puedes ignorar
          este mensaje.
        </p>
      `,
    });
  },

  async verifyConnection(): Promise<boolean> {
    if (!transporter) {
      return true;
    }

    await transporter.verify();

    return true;
  },
};
