import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = async ({ request }) => {
	const { a, b } = await request.json();
	console.log(request);
	console.log(a,b)
	return json(a + b);
	// const html = await getContributions()
	// console.log(html.slice(0,100))
	// return new Response(html)
}	

async function getContributions() {
	const api = 'https://codepsu21-intermediate.kattis.com/contests/codepsu21intermediate/standings'
	const response = await fetch(api)

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`)
	}


	return await response.text()
}
