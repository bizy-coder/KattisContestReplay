<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let num = 10;
	$: slider_num = [num];
	function updateTime(event: any) {
		num = event[0];
	}
</script>

<div style="height:50px"></div>

<div style="width:500px">
	<div>
		<Slider
			value={slider_num}
			onValueChange={updateTime}
			max={100}
			step={1}
			class="mx-5 flex-grow"
		/>
	</div>

	<div>
		<Input type="numeric" bind:value={num}></Input>
	</div>
</div>
