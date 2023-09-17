<script lang="ts">
	import Simulation from '../lib/components/Simulation.svelte';
	let simulation: Simulation;

	let simulationStartTime = new Date();
	let initialOutageEnabled = false;
	let secondOutageEnabled = false;
	let fcrEnabled = false;
	let frrEnabled = false;

	$: simulationParameters = {
		simulationStartTime,
		initialOutageEnabled,
		secondOutageEnabled,
		fcrEnabled,
		frrEnabled
	};

	const restartSimulation = () => {
		simulation.stopSimulation();
		simulationStartTime = new Date();
	};
</script>

<div class="controls">
	<input
		type="checkbox"
		name="initial-outage"
		id="initial-outage"
		bind:checked={initialOutageEnabled}
		on:click={() => restartSimulation()}
	/>
	<label for="initial-outage">Initial outage</label>
	<input
		type="checkbox"
		name="fcr"
		id="fcr"
		bind:checked={fcrEnabled}
		on:click={() => restartSimulation()}
	/>
	<label for="fcr">FCR</label>
	<input
		type="checkbox"
		name="frr"
		id="frr"
		bind:checked={frrEnabled}
		on:click={() => restartSimulation()}
	/>
	<label for="frr">FRR</label>
	<input
		type="checkbox"
		name="second-outage"
		id="second-outage"
		bind:checked={secondOutageEnabled}
		on:click={() => restartSimulation()}
	/>
	<label for="second-outage">Second outage</label>
	<button on:click={() => restartSimulation()}> Restart simulation </button>
</div>

{#key simulationParameters}
	<div class="graph">
		<Simulation
			bind:this={simulation}
			{initialOutageEnabled}
			{secondOutageEnabled}
			{fcrEnabled}
			{frrEnabled}
		/>
	</div>
{/key}

<style>
	.controls {
		margin: 2rem 1rem;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}
	.graph {
		margin: 2rem 1rem;
	}
</style>
