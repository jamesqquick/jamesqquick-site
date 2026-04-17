import { Resend } from "resend";
import { env } from "cloudflare:workers";
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from "astro:env/server";

export const sendEmail = async (
  fromEmail: string,
  text: string,
  subject: string
) => {
  await env.EMAIL.send({
    to: "me@jamesqquick.com",
    from: "speaking@jamesqquick.com",
    replyTo: fromEmail,
    subject,
    text,
  });
};

// Resend is still used for audience/contact management since
// Cloudflare Email Service doesn't have a contacts API.
let resend: Resend | null = null;

const getResendClient = () => {
  if (!resend) {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
};

export const addContact = async (email: string) => {
  if (!RESEND_AUDIENCE_ID) {
    throw new Error("RESEND_AUDIENCE_ID is not configured");
  }
  const { data, error } = await getResendClient().contacts.create({
    email,
    unsubscribed: false,
    audienceId: RESEND_AUDIENCE_ID,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};
