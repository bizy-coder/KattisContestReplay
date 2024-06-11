// import { json } from '@sveltejs/kit';
// import type { RequestHandler } from './$types';


// export const POST: RequestHandler = async ({ request }) => {
// 	const { a, b } = await request.json();
// 	console.log(request);
// 	console.log(a,b)
// 	return json(a + b);
// 	// const html = await getContributions()
// 	// console.log(html.slice(0,100))
// 	// return new Response(html)
// }	

import cheerio from 'cheerio';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


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

async function getScoreboardInfo(contestURL: string): Promise<TeamInfo[]> {
    console.log(contestURL);
	let response;
	try {
		response = await fetch(contestURL);
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}
	} catch (error) {
		throw new Error(`Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const scoreboard: TeamInfo[] = [];
    const problems = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J','K','L','M','N'];

    $('.standings-table tbody tr:not(:last-child)').each((index, element) => {
        const teamName = $(element).find('td').eq(1).text().trim();
        // Find the index of the column that contains the solved count by assuming it is the first number after the team name
        const solvedIndex = $(element).find('td').slice(2).filter((i, el) => /^\d+$/.test($(el).text().trim())).first().index();
        const solvedCount = parseInt($(element).find('td').eq(solvedIndex).text().trim(), 10);
        const totalTime = parseInt($(element).find('td').eq(solvedIndex + 1).text().trim(), 10);
        const problemsInfo: Record<string, ProblemInfo> = {};

        $(element).find('td').slice(solvedIndex + 2).each((i, el) => {
            if (i < problems.length) {
                const problemStatus = $(el).text().trim();
                const solved = $(el).hasClass('solved') || $(el).hasClass('first');
                const firstSolve = $(el).hasClass('first');

                const attempts = problemStatus ? parseInt(problemStatus.split('\n')[0].trim(), 10) : 0;
                const lastAttemptTime = problemStatus && solved ? parseInt(problemStatus.split('\n')[2].trim(), 10) : 0;

                problemsInfo[problems[i]] = {
                    solve_attempts: attempts,
                    last_attempted_time: lastAttemptTime,
                    first_solve: firstSolve,
                    solved: solved
                };
            }
        });

        scoreboard.push({
            NAME: teamName,
            SOLVED: solvedCount,
            TIME: totalTime,
            problems: problemsInfo
        });
    });

    return scoreboard;
}



export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();
		const info = await getScoreboardInfo(url);
		return new Response(JSON.stringify(info), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		let errorMessage = 'An unknown error occurred';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		return new Response(errorMessage, { status: 500 });
	}
};