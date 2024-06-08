<script lang="ts">
	import Scrollbar from './Scrollbar.svelte';
	import Table from './Table.svelte';

	let url: string = '';
	let x: string = 'test';

	/** @type {number} */
	let number: number;

	async function scrapeUrl() {
		const response = await fetch('/api/roll', {
			method: 'POST',
			body: JSON.stringify({ url, x }),
			headers: {
				'content-type': 'application/json'
			}
		});

		let total = await response.json();
		alert(total);
	}
</script>

<Scrollbar />
<Table />

<input type="text" bind:value={url} placeholder="Enter URL here" />
<button on:click={() => scrapeUrl()}>Scrape URL</button>
