import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from "astro:env/server";

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

export const sendEmail = async (
  fromEmail: string,
  text: string,
  subject: string
) => {
  await getResendClient().emails.send({
    to: "me@jamesqquick.com",
    from: "speaking@jamesqquick.com",
    replyTo: fromEmail,
    subject,
    text,
  });
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
