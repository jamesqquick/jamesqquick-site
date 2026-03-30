import { Resend } from "resend";
import { RESEND_API_KEY } from "astro:env/server";

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async (
  fromEmail: string,
  text: string,
  subject: string
) => {
  await resend.emails.send({
    to: "me@jamesqquick.com",
    from: "speaking@jamesqquick.com",
    replyTo: fromEmail,
    subject,
    text,
  });
};
