<script lang="ts">
  import { fade } from "svelte/transition";
  let email = "";
  let fullName = "";
  let details = "";
  let eventName = "";
  let errorMsg = "";
  let successMsg = "";
  const handleSubmit = async (e) => {
    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/speaking", {
        method: "POST",
        body: formData,
      });

      if (res.status !== 200) {
        errorMsg = "Request failed, please try again";
        return;
      }

      errorMsg = "";
      successMsg =
        "I'm looking forward to reviewing this request. Thank you for reaching out!";
      email = "";
      fullName = "";
      details = "";
      eventName = "";
    } catch (err) {
      console.error(err);
      errorMsg = "Request failed, please try again";
    }
  };
</script>

<form on:submit|preventDefault={handleSubmit} transition:fade>
  <input name="utf8" type="hidden" value="✓" />
  <div class="mb-10">
    <label for="eventName" class="text-lg font-light text-text block mb-2"
      >*Organization or event name</label
    >
    <input
      type="text"
      name="eventName"
      id="eventName"
      bind:value={eventName}
      required={true}
      class="border py-4 px-3 bg-surface-hover text-text grow w-full rounded-lg border-border placeholder:text-text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    />
  </div>
  <div class="mb-10">
    <label for="fullName" class="text-lg font-light text-text block mb-2"
      >*Full Name</label
    >
    <input
      type="text"
      id="fullName"
      name="fullName"
      bind:value={fullName}
      required={true}
      class="border py-4 px-3 bg-surface-hover text-text grow w-full rounded-lg border-border placeholder:text-text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    />
  </div>
  <div class="mb-10">
    <label for="email" class="text-lg font-light text-text block mb-2">*Email</label>
    <input
      type="email"
      id="email"
      name="email"
      bind:value={email}
      required={true}
      class="border py-4 px-3 bg-surface-hover text-text grow w-full rounded-lg border-border placeholder:text-text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    />
  </div>
  <div class="mb-4">
    <label for="detials" class="text-lg font-light text-text block mb-2"
      >*Anything else you think I should know like dates, location, etc.</label
    >
    <textarea
      name="details"
      id="details"
      required={true}
      bind:value={details}
      rows="10"
      class="border py-4 px-3 bg-surface-hover text-text grow w-full rounded-lg border-border placeholder:text-text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    ></textarea>
  </div>

  <button
    class={"text-lg rounded-lg mb-6 px-8 py-3 border border-accent/70 bg-accent text-bgDark hover:bg-accent/90 inline-block transition-all duration-300 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"}
  >
    Send Request
  </button>
  <p class="text-lg text-center text-textMuted" transition:fade>
    {#if successMsg}
      {successMsg}
    {:else if errorMsg}
      {errorMsg}
    {/if}
  </p>
</form>
