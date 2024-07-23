import { writable, type Writable } from 'svelte/store';

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
export const contestURLs = writable<string[]>(['']);
export const mirrorURLs = writable<string[]>(['']);
export let contestUrlMoreInfo = writable<boolean[]>([]);
export let mirrorUrlMoreInfo = writable<boolean[]>([]);

export const initializeMoreInfoStates = (urlArray: Writable<string[]>, moreInfoArray: Writable<boolean[]>) => {
    urlArray.subscribe((urls) => {
        moreInfoArray.set(urls.map(() => false));
    });
};

export let scoreboard_info = writable<TeamInfo[]>([]);
