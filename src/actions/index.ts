import { defineAction, z } from "astro:actions";
import { sendEmail } from "src/utils/emailer";

export const server = {
  contact: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      eventName: z.string(),
      fullName: z.string(),
      details: z.string(),
    }),
    handler: async ({ email, eventName, fullName, details }) => {
      try {
        const subject = `Speaker Request for ${eventName} from ${fullName}`;
        await sendEmail(email, details, subject);
        return { success: true };
      } catch (error) {
        console.error(error);
        return { success: false, error: "There was an error sending email" };
      }
    },
  }),
};
