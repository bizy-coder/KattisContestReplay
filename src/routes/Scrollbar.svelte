<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { CirclePlay, CirclePause, Plus, Minus } from 'lucide-svelte';
	import { contestURL, mirrorURL, problems, scoreboard_info } from './data-store';
	import type { TeamInfo, ProblemInfo } from './data-store';

	let hoursProgressed = 0;
	let minutesProgressed = 0;
	let secondsProgressed = 0;
	let isPlaying = false;
	let updateInterval: ReturnType<typeof setInterval>;
	let currentTimeInterval: ReturnType<typeof setInterval>;
	let totalContestSeconds = 3600 * 5;

	import { writable, get, type Writable } from 'svelte/store';
	let contestURLs = writable<string[]>(['']);
	let mirrorURLs = writable<string[]>(['']);

	$: currentTime =
		hoursProgressed +
		':' +
		(minutesProgressed > 9 ? minutesProgressed : '0' + minutesProgressed) +
		':' +
		(secondsProgressed % 60 > 9 ? secondsProgressed % 60 : '0' + secondsProgressed);

	$: progressValue = [3600 * hoursProgressed + 60 * minutesProgressed + secondsProgressed];

	async function scrapeUrl(url: string): Promise<TeamInfo[]> {
		try {
			const response = await fetch('/api/roll', {
				method: 'POST',
				body: JSON.stringify({ url }),
				headers: {
					'content-type': 'application/json'
				}
			});
			if (!response.ok) {
				throw new Error('Invalid URL');
			}
			const info = await response.json();
			return info;
		} catch (error) {
			// alert(`Error fetching data from ${url}: ${error.message}`);
			return [];
		}
	}

	function adjustContestProblems(team: TeamInfo, timeLimit: number): TeamInfo {
		const adjustedProblems: Record<string, ProblemInfo> = {};
		let solvedCount = 0;
		let totalTime = 0;

		for (const [problemId, problem] of Object.entries(team.problems)) {
			if (problem.solved && problem.last_attempted_time <= timeLimit) {
				adjustedProblems[problemId] = problem;
				solvedCount += 1;
				totalTime += problem.last_attempted_time + 20 * (problem.solve_attempts - 1);
			} else {
				adjustedProblems[problemId] = {
					...problem,
					solved: false,
					solve_attempts: 0,
					first_solve: false
				};
			}
		}

		return { ...team, problems: adjustedProblems, SOLVED: solvedCount, TIME: totalTime };
	}

	function mergeTeamInfos(teamInfos1: TeamInfo[], teamInfos2: TeamInfo[]): TeamInfo[] {
		// Combine the two arrays
		const combinedTeamInfos = [...teamInfos1, ...teamInfos2];

		// Flatten all problems into a single array to find the earliest solve for each problem
		const allProblems: { teamIndex: number; problemId: string; last_attempted_time: number }[] = [];

		combinedTeamInfos.forEach((team, teamIndex) => {
			for (const problemId in team.problems) {
				const problem = team.problems[problemId];
				if (problem.solved) {
					allProblems.push({
						teamIndex,
						problemId,
						last_attempted_time: problem.last_attempted_time
					});
				}
			}
		});

		// Sort all problems by last_attempted_time to find the first solve
		allProblems.sort((a, b) => a.last_attempted_time - b.last_attempted_time);

		// Create a map to track the first solve time for each problem
		const firstSolveTimes = new Map<string, number>();

		// Determine the first solve time for each problem
		allProblems.forEach(({ problemId, last_attempted_time }) => {
			if (!firstSolveTimes.has(problemId)) {
				firstSolveTimes.set(problemId, last_attempted_time);
			}
		});

		// Mark the first solve for each problem
		allProblems.forEach(({ teamIndex, problemId, last_attempted_time }) => {
			if (firstSolveTimes.get(problemId) === last_attempted_time) {
				combinedTeamInfos[teamIndex].problems[problemId].first_solve = true;
			} else {
				combinedTeamInfos[teamIndex].problems[problemId].first_solve = false;
			}
		});

		// Sort the combined team infos by number solved (descending) and then by time (ascending)
		combinedTeamInfos.sort((a, b) => {
			if (a.SOLVED !== b.SOLVED) {
				return b.SOLVED - a.SOLVED;
			}
			return a.TIME - b.TIME;
		});

		return combinedTeamInfos;
	}

	async function updatePage() {
		const urlList = get(contestURLs).filter((url) => url);
		const mirrorList = get(mirrorURLs).filter((url) => url);

		const contestScoreboardInfoPromises = urlList.map((url) => scrapeUrl(url));
		const mirrorScoreboardInfoPromises = mirrorList.map((url) => scrapeUrl(url));

		const contestScoreboardInfo = await Promise.all(contestScoreboardInfoPromises);
		const mirrorScoreboardInfo = await Promise.all(mirrorScoreboardInfoPromises);

		const contestTimeLimit = hoursProgressed * 60 + minutesProgressed;

		// Adjust contest team info to only include correct solutions before the given time
		const adjustedContestScoreboard = contestScoreboardInfo
			.flat()
			.map((team) => adjustContestProblems(team, contestTimeLimit));

		// Merge the adjusted contest scoreboard and mirror scoreboard
		let mergedScoreboard: TeamInfo[] = [];
		for (let scoreboard of adjustedContestScoreboard) {
			mergedScoreboard = mergeTeamInfos(mergedScoreboard, [scoreboard]);
		}
		for (let scoreboard of mirrorScoreboardInfo.flat()) {
			mergedScoreboard = mergeTeamInfos(mergedScoreboard, [scoreboard]);
		}

		scoreboard_info.set(mergedScoreboard);
		if (mergedScoreboard.length > 0) {
			problems.set(Object.keys(mergedScoreboard[0].problems));
		}
	}

	function addURL(urlArray: Writable<string[]>) {
		urlArray.update((urls) => [...urls, '']);
	}

	function removeURL(urlArray: Writable<string[]>, index: number) {
		urlArray.update((urls) => urls.filter((_, i) => i !== index));
	}

	function togglePlay() {
		isPlaying = !isPlaying;

		if (isPlaying) {
			// Update current time every second
			currentTimeInterval = setInterval(() => {
				secondsProgressed++;
				if (secondsProgressed % 60 === 0) {
					minutesProgressed++;
					secondsProgressed = 0;
					if (minutesProgressed % 60 === 0) {
						hoursProgressed++;
						minutesProgressed = 0;
					}
					// Update page every minute
					updatePage();
				}
			}, 1000);
		} else {
			clearInterval(currentTimeInterval);
		}
	}

	// Watch for changes in contestURLs and mirrorURLs to cache them
	$: {
		if (typeof window !== 'undefined') {
			localStorage.setItem('contestURLs', JSON.stringify(get(contestURLs)));
			localStorage.setItem('mirrorURLs', JSON.stringify(get(mirrorURLs)));
			localStorage.setItem('hoursProgressed', hoursProgressed.toString());
			localStorage.setItem('minutesProgressed', minutesProgressed.toString());
			localStorage.setItem('secondsProgressed', secondsProgressed.toString());
			localStorage.setItem('lastTimestamp', Date.now().toString());
			localStorage.setItem('isPlaying', JSON.stringify(isPlaying));
		} else {
		}
	}

	if (typeof window !== 'undefined') {
		const lastTimestamp = Number(localStorage.getItem('lastTimestamp')) || Date.now();
		const toPlay = localStorage.getItem('isPlaying')
			? localStorage.getItem('isPlaying') == 'true'
			: false;

		const elapsedSeconds = toPlay ? Math.floor((Date.now() - lastTimestamp) / 1000) : 0;

		hoursProgressed = Number(localStorage.getItem('hoursProgressed')) || 0;
		minutesProgressed = Number(localStorage.getItem('minutesProgressed')) || 0;
		secondsProgressed = Number(localStorage.getItem('secondsProgressed')) || 0;

		const totalSeconds = Math.min(
			hoursProgressed * 3600 + minutesProgressed * 60 + secondsProgressed + elapsedSeconds,
			5 * 3600
		);

		hoursProgressed = Math.floor(totalSeconds / 3600);
		minutesProgressed = Math.floor((totalSeconds % 3600) / 60);
		secondsProgressed = totalSeconds % 60;

		contestURLs.set(JSON.parse(localStorage.getItem('contestURLs') || '[""]'));
		mirrorURLs.set(JSON.parse(localStorage.getItem('mirrorURLs') || '[""]'));
		if (toPlay) {
			togglePlay();
		}
	}
	function scrollbarUpdated(event: any) {
		hoursProgressed = Math.floor(event[0] / 3600);
		minutesProgressed = Math.floor((event[0] % 3600) / 60);
		secondsProgressed = event[0] % 60;
	}

	let contestUrlMoreInfo = writable<boolean[]>([]);
	let mirrorUrlMoreInfo = writable<boolean[]>([]);

	function toggleMoreInfo(urlArrayMoreInfo: Writable<boolean[]>, index: number) {
		urlArrayMoreInfo.update((infos) => {
			infos[index] = !infos[index];
			return infos;
		});
	}

	function initializeMoreInfoStates(
		urlArray: Writable<string[]>,
		moreInfoArray: Writable<boolean[]>
	) {
		urlArray.subscribe((urls) => {
			moreInfoArray.set(urls.map(() => false));
		});
	}

	onMount(() => {
		updatePage(); // Initial call to updatePage when the component mounts
		initializeMoreInfoStates(contestURLs, contestUrlMoreInfo);
		initializeMoreInfoStates(mirrorURLs, mirrorUrlMoreInfo);
	});

	onDestroy(() => {
		clearInterval(currentTimeInterval);
	});
</script>

<div class="container">
	<!-- Time Display and Slider -->
	<div>{currentTime}</div>
	<div class="controls">
		<Dialog.Root>
			<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Settings</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[525px]">
				<Dialog.Header>
					<Dialog.Title>Settings</Dialog.Title>
					<Dialog.Description>Set up the original and mirrored contest(s).</Dialog.Description>
					<Dialog.Description
						>Hours and Minutes are for time into the original contest.</Dialog.Description
					>
				</Dialog.Header>
				<div class="pa-3 grid gap-4">
					<!-- Contest Links -->
					{#each $contestURLs as contestURL, index}
						<div class="grid grid-cols-5 items-center gap-2">
							<Label for="original_contest_{index}" class="col-span-1 text-right"
								>Original Contest {index + 1}</Label
							>
							<Input
								bind:value={$contestURLs[index]}
								id="original_contest_{index}"
								placeholder="Kattis link..."
								class="col-span-3"
							/>

							<div class="flex space-x-2">
								<button on:click={() => addURL(contestURLs)} class="p-1">
									<Plus size="16" />
								</button>
								{#if $contestURLs.length > 1}
									<button on:click={() => removeURL(contestURLs, index)} class="p-1">
										<Minus size="16" />
									</button>
								{/if}
								<button on:click={() => toggleMoreInfo(contestUrlMoreInfo, index)} class="p-1">
									{#if $contestUrlMoreInfo[index]}
										Hide Info
									{:else}
										More Info
									{/if}
								</button>
							</div>
						</div>
						{#if $contestUrlMoreInfo[index]}
							<Input placeholder="Enter label..." />
						{/if}
					{/each}

					{#each $mirrorURLs as mirrorURL, index}
						<div class="grid grid-cols-5 items-center gap-2">
							<Label for="new_contest_{index}" class="col-span-1 text-right"
								>Your Contest {index + 1}</Label
							>
							<Input
								bind:value={$mirrorURLs[index]}
								id="new_contest_{index}"
								placeholder="Kattis link..."
								class="col-span-3"
							/>
							<div class="flex space-x-2">
								<button on:click={() => addURL(mirrorURLs)} class="p-1">
									<Plus size="16" />
								</button>
								{#if $mirrorURLs.length > 1}
									<button on:click={() => removeURL(mirrorURLs, index)} class="p-1">
										<Minus size="16" />
									</button>
								{/if}
								<button on:click={() => toggleMoreInfo(mirrorUrlMoreInfo, index)} class="p-1">
									{#if $mirrorUrlMoreInfo[index]}
										Hide Info
									{:else}
										More Info
									{/if}
								</button>
							</div>
						</div>
						{#if $mirrorUrlMoreInfo[index]}
							<Input placeholder="Enter label..." />
						{/if}
					{/each}

					<!-- Time Controls -->
					<div class="grid grid-cols-10 gap-x-1 pb-4">
						<div class="col-span-1"></div>
						<Label for="hours" class="col-span-2 flex items-center justify-end">Hours</Label>
						<Input
							id="hours"
							type="number"
							bind:value={hoursProgressed}
							class="col-span-2"
							min="0"
							max="5"
						/>
						<Label for="minutes" class="col-span-2 flex items-center justify-end">Minutes</Label>
						<Input
							id="minutes"
							type="number"
							bind:value={minutesProgressed}
							class="col-span-2"
							min="0"
							max="59"
						/>
					</div>
				</div>
				<Dialog.Close class="flex justify-end">
					<Button type="submit" on:click={updatePage}>Save changes</Button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
		<Slider
			value={progressValue}
			max={totalContestSeconds}
			step={1}
			class="mx-5 flex-grow"
			onValueChange={scrollbarUpdated}
		/>
		<Button variant="outline" on:click={togglePlay}>
			{#if isPlaying}
				<CirclePause size="24" strokeWidth={2} />
			{:else}
				<CirclePlay size="24" />
			{/if}
		</Button>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 20px;
	}
	.controls {
		display: flex;
		justify-content: space-between;
		width: 100%;
		max-width: 600px; /* Adjust size as needed */
		margin-top: -10px;
	}
</style>
