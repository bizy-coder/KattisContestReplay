<script lang="ts">
	export let index: number;
	export let url: string;
	export let urls: Writable<string[]>;
	export let moreInfo: Writable<boolean[]>;
	import { writable, get, type Writable } from 'svelte/store';

	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Plus, Minus } from 'lucide-svelte';

	function addURL(urlArray: Writable<string[]>) {
		urlArray.update((urls) => [...urls, '']);
	}

	function removeURL(urlArray: Writable<string[]>, index: number) {
		urlArray.update((urls) => urls.filter((_, i) => i !== index));
	}

	function toggleMoreInfo(urlArrayMoreInfo: Writable<boolean[]>, index: number) {
		urlArrayMoreInfo.update((infos) => {
			infos[index] = !infos[index];
			return infos;
		});
	}
</script>

<div class="grid grid-cols-5 items-center gap-2">
	<Label for={`original_contest_${index}`} class="col-span-1 text-right">
		Original Contest {index + 1}
	</Label>
	<Input
		bind:value={url}
		id={`original_contest_${index}`}
		placeholder="Kattis link..."
		class="col-span-3"
	/>

	<div class="flex space-x-2">
		<Button on:click={addURL} class="p-1">
			<Plus size="16" />
		</Button>
		{#if $urls.length > 1}
			<Button on:click={removeURL} class="p-1">
				<Minus size="16" />
			</Button>
		{/if}
		<Button on:click={toggleMoreInfo} class="p-1">
			{#if $moreInfo[index]}
				Hide Info
			{:else}
				More Info
			{/if}
		</Button>
	</div>
</div>
{#if $moreInfo[index]}
	<Input placeholder="Enter label..." />
{/if}
