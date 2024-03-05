<script lang="ts">
  import tmi from "tmi.js";
  import { onMount } from "svelte";
  onMount(() => {
    const client = new tmi.Client({
      channels: ["jamesqquick"],
    });

    client.connect();

    client.on("message", (channel, tags, message, self) => {
      console.log(tags);
      console.log(`${tags["display-name"]}: ${message}`);
    });
  });
</script>

Streaming notifications!
