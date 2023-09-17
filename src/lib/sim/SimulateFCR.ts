export interface FCRReserveOptions {
	maxReserve?: number;
	deadband?: number;
	resolution?: number;
	responseDelay?: number;
}

const defaultOptions: FCRReserveOptions = {
	maxReserve: 0.015,
	deadband: 0,
	resolution: 50,
	responseDelay: 10_000
};

export class FCRReserve {
	private readonly maxReserve: number;
	private readonly deadband: number;
	private readonly frequencyReference = 50;
	private readonly frequenceDeltaForMaxReserve = 0.5;
	private readonly resolution;
	private readonly responseDelay;
	private readonly reserveValues: number[] = [];

	constructor(options?: FCRReserveOptions) {
		const mergedOptions = {
			...defaultOptions,
			...options
		};

		this.maxReserve = mergedOptions.maxReserve!;
		this.deadband = mergedOptions.deadband!;
		this.resolution = mergedOptions.resolution!;
		this.responseDelay = mergedOptions.responseDelay!;
		const windowSize = Math.ceil(this.responseDelay / this.resolution);
		this.reserveValues = new Array(windowSize).fill(0);
	}

	public computePowerCorrection(frequency: number): number {
		const currentReserveValue = this.computeReserveValue(frequency);
		const effectiveReserveValue = this.updateReserveValues(currentReserveValue);
		return effectiveReserveValue;
	}

	private computeReserveValue(frequency: number): number {
		const inDeadband = Math.abs(this.frequencyReference - frequency) < this.deadband;
		if (inDeadband) return 0;
		const relativeFrequencyDelta = Math.max(
			-1,
			Math.min(1, (this.frequencyReference - frequency) / this.frequenceDeltaForMaxReserve)
		);
		return relativeFrequencyDelta * this.maxReserve;
	}

	private updateReserveValues(reserveValue: number): number {
		this.reserveValues.push(reserveValue);
		return this.reserveValues.shift() || 0;
	}
}
