<script lang="ts">
	import { xml } from 'cheerio';
	import Scrollbar from './Scrollbar.svelte';
	import Table from './Table.svelte';
	import { problems } from './data-store';
	import { scoreboard_info } from './data-store';

	let contestURL = '';

	let test: TeamInfo[] = [];

	type ProblemInfo = {
		solve_attempts: number;
		last_attempted_time: number;
		first_solve: boolean;
		solved: boolean;
	};

	type GeneralInfo = {
		NAME: string;
		SOLVED: number;
		TIME: number;
	};

	type TeamInfo = GeneralInfo & {
		problems: Record<string, ProblemInfo>;
	};

	async function scrapeUrl() {
		// alert(contestURL);
		// alert(b);
		const response = await fetch('/api/roll', {
			method: 'POST',
			body: JSON.stringify({ contestURL }),
			headers: {
				'content-type': 'application/json'
			}
		});

		test = await response.json();
		// scoreboard_info = total;
		scoreboard_info.set(test);
		if (test) {
			problems.set(Object.keys(test[0].problems));
		}
	}
</script>

<Scrollbar />
<Table scoreboard_info={$scoreboard_info} problems={$problems} />

<input type="text" bind:value={contestURL} placeholder="Enter URL here" />
<button on:click={scrapeUrl}>Scrape URL</button>
