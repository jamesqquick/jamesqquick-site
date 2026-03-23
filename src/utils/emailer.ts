import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "astro:env/server";

if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not configured");
}

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async (
  fromEmail: string,
  text: string,
  subject: string
) => {
  const msg = {
    to: "me@jamesqquick.com",
    from: fromEmail,
    subject,
    text,
  };
  await sgMail.send(msg);
};
