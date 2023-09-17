<script lang="ts">
	import type { ScaleLinear } from 'd3-scale';

	export let height: number;
	export let xScale: ScaleLinear<number, number>;
	export let margin: { top: number; right: number; left: number; bottom: number };

	$: xTicks = xScale.ticks(6); //[0, 50, 100, 150, 200, 250];
</script>

<g>
	{#each xTicks as tick}
		<text x={xScale(tick)} y={height - margin.bottom} dy="6" dominant-baseline="hanging"
			>{tick / 1000} s</text
		>
	{/each}
</g>
