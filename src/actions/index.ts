import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { addContact } from "../utils/emailer";

export const server = {
  newsletter: {
    subscribe: defineAction({
      accept: "form",
      input: z.object({
        email: z.string().email("Please enter a valid email address."),
      }),
      handler: async ({ email }) => {
        try {
          await addContact(email);
          return { success: true };
        } catch (err) {
          console.error("Newsletter subscribe error:", err);
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to subscribe. Please try again.",
          });
        }
      },
    }),
  },
};
