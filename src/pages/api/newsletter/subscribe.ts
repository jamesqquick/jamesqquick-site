import type { APIRoute } from "astro";
import { validateEmail } from "../../../utils/newsletter";

export const post: APIRoute = async (context) => {
  const newsletterId = context.url.searchParams.get("id");
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (!newsletterId) {
    return new Response(JSON.stringify({ msg: "Newsletter id required" }), {
      status: 400,
      headers,
    });
  }
  const newsletterURL = `https://learn.jamesqquick.com/email_lists/${newsletterId}/subscriptions`;

  const { email } = await context.request.json();

  if (typeof email !== "string" || !validateEmail(email)) {
    return new Response(JSON.stringify({ msg: "Invalid email" }), {
      status: 400,
      headers,
    });
  }
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email,
      }),
    };

    const res = await fetch(newsletterURL, options);
    if (res.status === 404) {
      return new Response(
        JSON.stringify({ msg: `Couldn't find that newsletter` }),
        {
          status: 404,
          headers,
        }
      );
    }
    if (res.status !== 200) {
      return new Response(
        JSON.stringify({ msg: "Error", res: JSON.stringify(res) }),
        {
          status: 500,
          headers,
        }
      );
    }
    return new Response(JSON.stringify({ msg: "Subscribed successfully" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ err }), {
      status: 500,
      headers,
    });
  }
};

export const options: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
};
