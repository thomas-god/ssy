<script lang="ts">
	import Graph from './Graph.svelte';
	import { FrequencySimulator } from '../sim/SimulateFrequency';
	import { FCRReserve } from '../sim/SimulateFCR';
	import { FRRReserve } from '../sim/SimulateFRR';
	import throttle from 'lodash-es/throttle';

	export let initialOutageEnabled = false;
	export let secondOutageEnabled = false;
	export let fcrEnabled = false;
	export let frrEnabled = false;

	const systemLoad = 250;
	const resolution = 300;
	const maxTs = 205_000;
	let frequencyData = [{ ts: 0, frequency: 50 }];
	let lastFcrValue = 0;
	let lastFrrValue = 0;
	let powerImbalance = 0;
	let currentTime = 0;

	const initialOutageDelay = 20_000;
	const secondOutageDelay = 110_000;
	const frequencySimulator = new FrequencySimulator({
		randomVariations: true,
		inertia: 12,
		resolution: resolution
	});
	const maxFcrReserve = 0.015;
	const fcrReserve = new FCRReserve({
		maxReserve: maxFcrReserve,
		deadband: 0.01,
		resolution
	});
	const maxFrrReserve = 0.02;
	const frrReserve = new FRRReserve({
		maxReserve: maxFrrReserve,
		responseDelay: 133_000,
		resolution
	});

	const interval = setInterval(simulationCallback, 1);

	export const stopSimulation = () => clearInterval(interval);

	function simulationCallback() {
		const fcrPower = fcrEnabled
			? fcrReserve.computePowerCorrection(frequencyData.at(-1)!.frequency)
			: 0;
		const frrPower = frrEnabled ? frrReserve.computePowerCorrection(frequencyData.at(-1)!) : 0;
		const initialPowerImbalance =
			initialOutageEnabled && currentTime > initialOutageDelay ? -0.012 : 0;
		const newPowerImbalance = secondOutageEnabled && currentTime > secondOutageDelay ? -0.012 : 0;
		const newPoint = frequencySimulator.simulateNextFrequencyPoint(
			initialPowerImbalance + newPowerImbalance + fcrPower + frrPower
		);

		if (newPoint.ts > maxTs) clearInterval(interval);
		if (newPoint.frequency < 49 || newPoint.frequency > 50.5) clearInterval(interval);

		currentTime = newPoint.ts;
		frequencyData = [...frequencyData, newPoint];
		lastFcrValue = fcrPower;
		lastFrrValue = frrPower;
		powerImbalance = initialPowerImbalance + newPowerImbalance + fcrPower + frrPower;
	}

	$: hasInitialOutageOccurred = initialOutageEnabled && currentTime > initialOutageDelay;
	$: hasSecondOutageOccurred = secondOutageEnabled && currentTime > secondOutageDelay;
	$: outages = [
		{ ts: initialOutageDelay, enabled: hasInitialOutageOccurred },
		{ ts: secondOutageDelay, enabled: hasSecondOutageOccurred }
	];

	const computeTitles = () => ({
		frequency: `Frequency ${frequencyData.at(-1)!.frequency.toFixed(2)} Hz`,
		fcrReserveValue: `FCR: ${(lastFcrValue * systemLoad * 1000).toFixed(0)} MW (${(
			(lastFcrValue / maxFcrReserve) *
			100
		).toFixed(0)}%)`,
		frrReserveValue: `FRR: ${(lastFrrValue * systemLoad * 1000).toFixed(0)} MW (${(
			(lastFrrValue / maxFrrReserve) *
			100
		).toFixed(0)}%)`,
		powerImbalanceValue: `Imbalance: ${(250 * 1000 * powerImbalance).toFixed(0)} MW`
	});
	let titles = computeTitles();
	let throttledUpdateTitle = throttle(() => {
		titles = computeTitles();
	}, 500);
	$: frequencyData, throttledUpdateTitle();
</script>

<h1>{titles.frequency}</h1>
<div class="indicators">
	<h2>{titles.powerImbalanceValue}</h2>
	<h2>{titles.fcrReserveValue}</h2>
	<h2>{titles.frrReserveValue}</h2>
</div>

<Graph data={frequencyData} {maxTs} {outages} />

<style>
	h1 {
		text-align: center;
	}
	div {
		display: flex;
		justify-content: space-around;
	}
	h2 {
		text-align: center;
	}

	.indicators {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	.indicators > * {
		flex: 1 0 auto;
		text-align: left;
	}
</style>
