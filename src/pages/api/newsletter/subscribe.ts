import type { APIRoute } from "astro";
import { validateEmail } from "../../../utils/newsletter";

export const post: APIRoute = async (context) => {
  const newsletterId = context.url.searchParams.get("id");
  if (!newsletterId) {
    return new Response(JSON.stringify({ msg: "Newsletter id required" }), {
      status: 400,
    });
  }
  const newsletterURL = `https://learn.jamesqquick.com/email_lists/${newsletterId}/subscriptions`;
  const formData = await context.request.formData();
  const email = formData.get("email")?.valueOf();

  if (typeof email !== "string" || !validateEmail(email)) {
    return new Response(JSON.stringify({ msg: "Invalid email" }), {
      status: 400,
    });
  }

  try {
    const res = await fetch(newsletterURL, {
      method: "POST",
      body: formData,
    });
    console.log(res.status);
    if (res.status === 404) {
      return new Response(
        JSON.stringify({ msg: `Couldn't find that newsletter` }),
        { status: 404 }
      );
    }
    if (res.status !== 200) {
      return new Response(JSON.stringify({ msg: "Error" }), { status: 500 });
    }
    return new Response(JSON.stringify({ msg: "Subscribed successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to subscribe", { status: 500 });
  }
};
