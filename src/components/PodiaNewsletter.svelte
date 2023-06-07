<script lang="ts">
  import { validateEmail } from "../utils/newsletter";

  let email = "";
  let errorMsg: string | null = null;
  let successMsg: string | null = null;
  let loading = false;
  export let newsletterId: string;

  const handleOnSubmit = async (_: SubmitEvent) => {
    loading = true;

    if (!validateEmail(email)) {
      loading = false;
      return (errorMsg = "Please enter a valid email.");
    }

    try {
      const res = await fetch(`/api/newsletter/subscribe?id=${newsletterId}}`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (res.status !== 200) {
        errorMsg = "Subscribe failed. Please try again.";
      } else {
        errorMsg = null;
        successMsg = "You have been subscribed!";
        email = "";
      }
      const data = await res.json();
    } catch (err) {
      console.error(err);
    } finally {
      errorMsg = "Subscribe failed. Please try again.";
      loading = false;
    }
  };
</script>

{#if !successMsg}
  <form on:submit|preventDefault={handleOnSubmit}>
    <div class="h-6">
      {#if errorMsg}
        <p class="text-red-400">{errorMsg}</p>
      {/if}
    </div>
    <label for="email" class="sr-only" aria-label="Email">Email Address</label>
    <div class="flex flex-col md:flex-row gap-4 md:gap-10 relative">
      <input
        type="email"
        name="email"
        bind:value={email}
        required={true}
        placeholder="dev@developer.com"
        class="border-2 py-6 px-6 bg-transparent grow rounded-full"
      />

      <button
        class="text-xl rounded-full px-4 py-4 sm:py-2 bg-white text-bg hover:bg-brand hover:border-brand hover:scale-105 transition-all inline-block sm:absolute right-4 top-[50%] -translate-y-[50%] mt-6 sm:mt-0"
      >
        Sign Me Up!
      </button>
    </div>
  </form>
{/if}
{#if successMsg}
  <h2 class={`text-2xl font-bold  text-brand mb-2 text-center`}>Subscribed!</h2>

  <p class={`text-xl  md:text-2xl text-white mb-4 text-center`}>
    You just made an amazing decision. 👏
  </p>
{/if}
