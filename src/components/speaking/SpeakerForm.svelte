<script lang="ts">
  import { validateEmail } from "../../utils/newsletter";
  import { fade } from "svelte/transition";
  let email = "";
  let fullName = "";
  let details = "";
  let eventName = "";
  let errorMsg = "";
  let successMsg = "";
  const handleSubmit = async (e) => {
    console.log(email, fullName, eventName, details);
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

{#if successMsg}
  <p class="text-2xl text-center" transition:fade>{successMsg}</p>
{:else}
  <form on:submit|preventDefault={handleSubmit} transition:fade>
    <input name="utf8" type="hidden" value="✓" />
    <div class="mb-10">
      <label for="eventName" class="text-lg md:text-2xl font-light block mb-2"
        >*Organization/Event Name</label
      >
      <input
        type="text"
        name="eventName"
        bind:value={eventName}
        required={true}
        class="border-2 py-4 px-2 bg-transparent grow w-full"
      />
    </div>
    <div class="mb-10">
      <label for="fullName" class="text-lg md:text-2xl font-light block mb-2"
        >*Full Name</label
      >
      <input
        type="text"
        name="fullName"
        bind:value={fullName}
        required={true}
        class="border-2 py-4 px-2 bg-transparent grow w-full"
      />
    </div>
    <div class="mb-10">
      <label for="email" class="text-lg md:text-2xl font-light block mb-2"
        >*Email</label
      >
      <input
        type="email"
        name="email"
        bind:value={email}
        required={true}
        class="border-2 py-4 px-2 bg-transparent grow w-full"
      />
    </div>
    <div class="mb-10">
      <label for="detials" class="text-lg md:text-2xl font-light block mb-2"
        >*Anything else you think I should know like dates, location, etc.</label
      >
      <textarea
        name="details"
        required={true}
        bind:value={details}
        rows="10"
        class="border-2 py-4 px-2 bg-transparent grow w-full"
      />
    </div>
    <div class="h-4"><p>{errorMsg}</p></div>
    <button
      class={"text-2xl rounded-full px-10 py-4 border text-white hover:text-brand hover:border-brand inline-block transition-all duration-300 ease-in-out"}
    >
      Send Request
    </button>
  </form>
{/if}
