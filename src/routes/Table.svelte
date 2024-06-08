<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import TableRow from '$lib/components/ui/table/table-row.svelte'; // Ensure the import path is correct
	import { CircleCheck, CircleX } from 'lucide-svelte';

	export let problems;
	export let scoreboard_info;
</script>

<div class="scoreboard">
	<Table.Root>
		<!-- <Table.Caption>A list of your recent invoices.</Table.Caption> -->
		<Table.Header>
			<Table.Row>
				<Table.Head class="min-w-[100px]">Team</Table.Head>
				<Table.Head>Solved</Table.Head>
				<Table.Head>Time</Table.Head>
				{#each problems as problem, i (i)}
					<Table.Head class="pl-7">{problem}</Table.Head>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body class="border-b">
			{#each scoreboard_info as team, i (i)}
				<!-- {#if i%2==0} -->
				<TableRow class={i % 2 === 1 ? 'bg-muted/60' : ''}>
					<Table.Cell class=" font-medium">{team.NAME}</Table.Cell>
					<Table.Cell class="w-[3rem]  font-medium">
						{team.SOLVED}
					</Table.Cell>
					<Table.Cell class="w-[3rem]  font-medium">{team.TIME}</Table.Cell>

					{#each Object.keys(team.problems) as problem, i (i)}
						<Table.Cell class="ml-5 w-[10rem] text-left">
							<div class="flex items-center">
								{#if team.problems[problem].solve_attempts > 0}
									{#if team.problems[problem].first_solve}
										<CircleCheck fill="#006400" size="36" strokeWidth={1} color="white" />
									{:else if team.problems[problem].solved}
										<CircleCheck fill="#90EE90" size="36" strokeWidth={1} color="white" />
									{:else}
										<CircleX fill="red" size="36" strokeWidth={1} color="white" />
									{/if}
									<div class="-mt-1 flex flex-col justify-between" style="height: 36px;">
										{#if team.problems[problem].solve_attempts}
											<span class="text-sm">{team.problems[problem].solve_attempts}</span>
											<span class="text-xs text-gray-500">
												{#if team.problems[problem].solved}
													{Math.floor(team.problems[problem].last_attempted_time / 60) +
														':' +
														(team.problems[problem].last_attempted_time % 60 > 9
															? team.problems[problem].last_attempted_time % 60
															: '0' + (team.problems[problem].last_attempted_time % 60))}
												{:else}
													<span class="ml-0.5">-</span>
												{/if}
											</span>
										{/if}
									</div>
								{/if}
							</div>
						</Table.Cell>
					{/each}
				</TableRow>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<style>
	.scoreboard {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80%;
		margin: 0 auto;
		margin-top: 20px;
	}

	/* Responsive adjustments for smaller screens */
	@media (max-width: 1698px) {
		.scoreboard {
			width: 95%; /* Increase width on smaller screens */
		}
	}
</style>
