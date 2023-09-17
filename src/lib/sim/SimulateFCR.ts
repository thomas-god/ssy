export interface FCRReserveOptions {
	maxReserve?: number;
	deadband?: number;
}

const defaultOptions: FCRReserveOptions = {
	maxReserve: 0.015,
	deadband: 0
};

export class FCRReserve {
	private readonly maxReserve: number;
	private readonly deadband: number;
	private readonly frequencyReference = 50;
	private readonly frequenceDeltaForMaxReserve = 0.5;

	constructor(options?: FCRReserveOptions) {
		const mergedOptions = {
			...defaultOptions,
			...options
		};

		this.maxReserve = mergedOptions.maxReserve!;
		this.deadband = mergedOptions.deadband!;
	}

	public computePowerCorrection(frequency: number): number {
		const inDeadband = Math.abs(this.frequencyReference - frequency) < this.deadband;
		if (inDeadband) return 0;
		const relativeFrequencyDelta = Math.max(
			-1,
			Math.min(1, (this.frequencyReference - frequency) / this.frequenceDeltaForMaxReserve)
		);
		return relativeFrequencyDelta * this.maxReserve;
	}
}
