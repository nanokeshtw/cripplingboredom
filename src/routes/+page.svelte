<script lang="ts">
  import type { Activity, ActivityResource } from "$lib";
  import { onMount } from "svelte";
  import { elasticInOut } from "svelte/easing";
  import { scale, slide } from "svelte/transition";

  const version: string = __APP_VERSION__;

  let templates: string[] = [];
  let activity: Activity | null = null;
  let resources: ActivityResource[] | null = null;
  let currentTemplate: string | null = null;
  let timeBetweenNextWord = 300;
  let errorMessage: string | null = null;
  let openCantConfirmation: boolean = false;

  const handleToggleCantConfirmation = () => {
    openCantConfirmation = !openCantConfirmation;
  };

  const handleGetActivity = async () => {
    activity = null;
    resources = null;
    currentTemplate = templates[0];

    const start = new Date().getTime();
    const timeout = () => {
      currentTemplate = templates[Math.floor(Math.random() * templates.length)];
      const end = new Date().getTime();
      if (end - start < 3500) timeBetweenNextWord /= 1.15;
      else timeBetweenNextWord *= 1.35;
      if (timeBetweenNextWord < 50) timeBetweenNextWord = 50;

      if (end - start < 5000 && activity)
        setTimeout(timeout, timeBetweenNextWord);
      else (timeBetweenNextWord = 300) && (currentTemplate = null);
    };
    setTimeout(timeout, timeBetweenNextWord);

    try {
      const response = await fetch("/", {
        method: "POST",
      });
      if (response.status != 200) {
        activity = null;
        errorMessage = await response.text();
      } else {
        activity = await response.json();
        if (!activity) throw new Error("No activity found");
        const resourcesResponse = await fetch(`/resources/${activity.id}`);
        resources = await resourcesResponse.json();
      }
    } catch (error) {
      console.error(error);
      errorMessage = "Couldn't fetch activity 😥";
      activity = null;
      resources = null;
    }
  };

  onMount(async () => {
    const response = await fetch("/");
    templates = (await response.text()).split("\n");
  });
</script>

<svelte:head>
  <title
    >Crippling Boredom{currentTemplate || activity
      ? ` | ${currentTemplate || activity}`
      : ""}</title
  >
</svelte:head>
{#if openCantConfirmation}
  <div class="modal--backdrop">
    <div class="modal">
      <h2>You Sure You Can't?</h2>
      <button
        class="danger"
        on:click={() => {
          handleToggleCantConfirmation();
          handleGetActivity();
        }}>I Really Can't 😥</button
      >
      <button on:click={handleToggleCantConfirmation}
        >Actually I Will Do It! 💪</button
      >
    </div>
  </div>
{/if}
<main>
  <h1>Im Bored, What Should I Do?</h1>
  <div class="box">
    <p
      class="activity"
      class:gray={!(currentTemplate || activity) || errorMessage}
    >
      {errorMessage ||
        currentTemplate ||
        (activity ? activity.name : undefined) ||
        "You should..."}
    </p>
  </div>
  {#if activity && !currentTemplate}
    <div in:scale={{ delay: 400, start: 1.2 }}>
      <button class="danger" on:click={handleToggleCantConfirmation}
        >I Can't 😥</button
      >
      <button>Do It! 💪</button>
    </div>
  {:else}
    <div out:scale={{ duration: 400, start: 1.1 }}>
      <button on:click={handleGetActivity}>Find Out</button>
    </div>
  {/if}
  {#if resources}
    <div
      class="benefits"
      in:slide={{ delay: 5000, duration: 2500, easing: elasticInOut }}
    >
      {#each resources as resource}
        {JSON.stringify(resources)}
        {@const isText = typeof resource === "string"}
        {#if isText}
          <p>{resource}</p>
        {:else}
          <div class="card">
            <a href={resource.url} target="_blank">Go To</a>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</main>
<footer>Version: {version}</footer>

<style>
  main {
    display: block;
    margin: 0 auto;
    max-width: 800px;
    padding: 1rem;
    text-align: center;
  }

  footer {
    margin-top: auto;
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .activity {
    width: fit-content;
    border-radius: 6px;
    margin: 1rem auto;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    background-color: #203344;
  }

  p.gray {
    color: #808080;
  }

  button.danger {
    margin-right: 0.5rem;
  }

  button {
    margin-bottom: 2rem;
  }

  .card {
    border-radius: 6px;
    margin-block: 1rem;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    background-color: #203344;
  }

  .modal--backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.25);
  }

  .modal {
    height: fit-content;
    border-radius: 6px;
    padding: 1rem;
    background-color: #f0f0f0;
    color: #203344;
    text-align: center;
  }
</style>
