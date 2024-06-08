<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import TableRow from '$lib/components/ui/table/table-row.svelte'; // Ensure the import path is correct
	import { CircleCheck, CircleX } from 'lucide-svelte';

	const problems = ['A', 'B', 'C', 'D', 'E'];

	const scoreboard_info: TeamInfo[] = [
		{
			NAME: 'PSU Blue',
			SOLVED: 4,
			TIME: 111,
			problems: {
				// Encapsulating problem-specific info under 'problems' key
				A: {
					solve_attempts: 2,
					last_attempted_time: 32,
					first_solve: true,
					solved: true
				},
				B: {
					solve_attempts: 2,
					last_attempted_time: 32,
					first_solve: false,
					solved: true
				},
				C: {
					solve_attempts: 5,
					last_attempted_time: 32,
					first_solve: false,
					solved: false
				},
				D: {
					solve_attempts: 0,
					last_attempted_time: 0,
					first_solve: false,
					solved: false
				},
				E: {
					solve_attempts: 5,
					last_attempted_time: 76,
					first_solve: true,
					solved: true
				}
			}
		}
	];

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
</script>

<div class="scoreboard">
	<Table.Root>
		<!-- <Table.Caption>A list of your recent invoices.</Table.Caption> -->
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">Team</Table.Head>
				<Table.Head>Solved</Table.Head>
				<Table.Head>Time</Table.Head>
				{#each problems as problem, i (i)}
					<Table.Head class="text-left">{problem}</Table.Head>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body class="border-b">
			{#each scoreboard_info as team, i (i)}
				<!-- {#if i%2==0} -->
				<TableRow class={i % 2 === 1 ? 'bg-muted/60' : ''}>
					<Table.Cell class=" font-medium">{team.NAME}</Table.Cell>
					<Table.Cell class="w-[5rem]  font-medium">
						{team.SOLVED}
					</Table.Cell>
					<Table.Cell class="w-[5rem]  font-medium">{team.TIME}</Table.Cell>

					{#each Object.keys(team.problems) as problem, i (i)}
						<Table.Cell class="w-[5rem]  text-left">
							<div class="flex items-center">
								{#if team.problems[problem].solve_attempts > 0}
									{#if team.problems[problem].first_solve}
										<CircleCheck fill="#006400" size="36" strokeWidth={1} color="white" />
									{:else if team.problems[problem].solved}
										<CircleCheck fill="#90EE90" size="36" strokeWidth={1} color="white" />
									{:else}
										<CircleX fill="red" size="36" strokeWidth={1} color="white" />
									{/if}
									<div class="ml-.5 -mt-1 flex flex-col justify-between" style="height: 36px;">
										{#if team.problems[problem].solve_attempts}
											<span class="text-sm">{team.problems[problem].solve_attempts}</span>
											<span class="text-xs text-gray-500">
												{team.problems[problem].last_attempted_time + ' mins'}
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
		margin: 0 auto; /* Add this to center the scoreboard div itself horizontally */
		margin-top: 20px;
	}
</style>
