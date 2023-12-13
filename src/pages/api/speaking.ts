import { APIRoute } from "astro";
import { validateEmail } from "../../utils/newsletter";
import { sendEmail } from "../../utils/emailer";

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const email = formData.get("email")?.valueOf();
  const eventName = formData.get("eventName")?.valueOf();
  const fullName = formData.get("fullName")?.valueOf();
  const details = formData.get("details")?.valueOf();
  if (
    typeof email !== "string" ||
    !validateEmail(email) ||
    !fullName ||
    typeof fullName !== "string" ||
    !details ||
    typeof details !== "string" ||
    !eventName ||
    typeof eventName !== "string"
  ) {
    return new Response(
      JSON.stringify({ msg: "Invalid request", status: 400 })
    );
  }
  try {
    const subject = `Speaker Request for ${eventName} from ${fullName}`;
    await sendEmail(email, details, subject);
    return new Response(
      JSON.stringify({ msg: "Request submitted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "There was an error sending email" }),
      {
        status: 500,
      }
    );
  }
};
