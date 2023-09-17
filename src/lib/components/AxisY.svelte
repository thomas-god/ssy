<script lang="ts">
	import type { ScaleLinear } from 'd3-scale';

	export let width: number;
	export let yScale: ScaleLinear<number, number>;
	export let margin: { top: number; right: number; left: number; bottom: number };

	let yTicks = [48, 49, 50, 51, 52];
</script>

<g transform="translate({margin.left} {margin.top})">
	{#each yTicks as tick}
		<text x={0} y={yScale(tick)} dy="-6">{tick} {' Hz'}</text>
		<line
			x1="0"
			y1={yScale(tick)}
			x2={width}
			y2={yScale(tick)}
			stroke={tick == 0 ? 'black' : '#cecece'}
		/>
	{/each}
</g>
