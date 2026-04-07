<script lang="ts">
  import { actions, isInputError } from "astro:actions";

  let email = $state("");
  let errorMsg = $state("");
  let success = $state(false);
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = "";

    const formData = new FormData(e.target as HTMLFormElement);
    const { error } = await actions.newsletter.subscribe(formData);

    if (error) {
      if (isInputError(error)) {
        errorMsg = error.fields.email?.join(", ") ?? "Invalid input.";
      } else {
        errorMsg = error.message || "Subscribe failed. Please try again.";
      }
    } else {
      success = true;
      email = "";
    }

    loading = false;
  }
</script>

{#if success}
  <div>
    <h2 class="text-2xl font-bold text-accent mb-2 text-center">Subscribed!</h2>
    <p class="text-xl md:text-2xl text-text mb-4 text-center">
      You just made an amazing decision.
    </p>
  </div>
{:else}
  <form onsubmit={handleSubmit}>
    <div class="h-6">
      {#if errorMsg}
        <p class="text-red-400">{errorMsg}</p>
      {/if}
    </div>
    <label for="email" class="sr-only" aria-label="Email">Email Address</label>
    <div class="flex flex-col md:flex-row gap-4 md:gap-10 relative">
      <input
        type="email"
        id="email"
        name="email"
        required
        bind:value={email}
        placeholder="dev@developer.com"
        class="border-2 py-6 px-6 bg-transparent grow rounded-full"
      />
      <button
        disabled={loading}
        class="text-xl rounded-full px-4 py-4 sm:py-2 bg-accent text-[var(--color-text-on-accent)] hover:bg-accentHover hover:scale-105 transition-all inline-block sm:absolute right-4 top-[50%] -translate-y-[50%] mt-6 sm:mt-0"
      >
        {loading ? "Subscribing..." : "Sign Me Up!"}
      </button>
    </div>
  </form>
{/if}
