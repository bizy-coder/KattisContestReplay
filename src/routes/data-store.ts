import { writable } from 'svelte/store';

export type ProblemInfo = {
	solve_attempts: number;
	last_attempted_time: number;
	first_solve: boolean;
	solved: boolean;
};

export type GeneralInfo = {
	NAME: string;
	SOLVED: number;
	TIME: number;
};

export type TeamInfo = GeneralInfo & {
	problems: Record<string, ProblemInfo>;
};


export let problems = writable(['A', 'B', 'C', 'D', 'E', '...']);
export let contestURL = writable('');
export let mirrorURL = writable('');



export let scoreboard_info = writable<TeamInfo[]>([]);
