<script lang="ts">
	export let data: { ts: number; frequency: number }[];
	export let maxTs: number;
	export let outages: { ts: number; enabled: boolean }[];

	import { scaleLinear } from 'd3-scale';

	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';

	let width = 400;
	let height = 400;

	const margin = { top: 20, right: 40, left: 0, bottom: 20 };

	$: xScale = scaleLinear()
		.domain([0, maxTs])
		.range([0, width - margin.left - margin.right]);

	const yScale = scaleLinear()
		.domain([48.5, 51.5])
		.range([height - margin.top - margin.bottom, 0]);

	$: polylineData = data.map((d) => `${xScale(d.ts)},${yScale(d.frequency).toFixed(2)}`).join(' ');
</script>

<div class="chart-container" bind:clientWidth={width}>
	<svg {width} {height}>
		<AxisX {height} {xScale} {margin} />
		<AxisY {width} {yScale} {margin} />
		<g class="circles" transform="translate({margin.left} {margin.top})">
			<polyline fill="none" stroke="black" points={polylineData} />
		</g>
		<g class="circles" transform="translate({margin.left} {margin.top})">
			{#each outages.filter((o) => o.enabled) as outage}
				<line
					x1={xScale(outage.ts)}
					x2={xScale(outage.ts)}
					y1={yScale(48.5)}
					y2={yScale(51.5)}
					stroke="red"
					stroke-width="1"
					stroke-dasharray="5,5"
				/>
				<text
					x={xScale(outage.ts) + 5}
					y={yScale(50) - 20}
					font-size="30"
					fill="red"
					stroke="none"
					text-anchor="start"
				>
					⚡
				</text>
			{/each}
		</g></svg
	>
</div>
