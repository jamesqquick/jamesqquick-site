import sgMail from "@sendgrid/mail";
sgMail.setApiKey(import.meta.env.SENDGRID_API_KEY);

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
