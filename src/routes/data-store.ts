import { writable } from 'svelte/store';

export let problems = writable(['A', 'B', 'C', 'D', 'E']);

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

export let scoreboard_info = writable<TeamInfo[]>([
	{
		NAME: 'PSU Blue',
		SOLVED: 4,
		TIME: 111,
		problems: {
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
]);
