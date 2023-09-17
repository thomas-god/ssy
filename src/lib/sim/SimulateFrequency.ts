export interface FrequencyPoint {
	ts: number;
	frequency: number;
}

export interface FrequencySimulatorOptions {
	resolution?: number;
	inertia?: number;
	initialFrequency?: number;
	randomVariations?: boolean;
}

const defaultOptions: FrequencySimulatorOptions = {
	resolution: 50,
	inertia: 12,
	initialFrequency: 50,
	randomVariations: false
};

export class FrequencySimulator {
	private readonly frequencyPoints: FrequencyPoint[];
	private readonly resolution: number;
	private readonly inertia: number;
	private readonly randomVariations: boolean;

	constructor(options?: FrequencySimulatorOptions) {
		const mergedOptions = {
			...defaultOptions,
			...options
		};

		this.resolution = mergedOptions.resolution!;
		this.inertia = mergedOptions.inertia!;
		this.randomVariations = mergedOptions.randomVariations!;

		this.frequencyPoints = [
			{
				ts: 0,
				frequency: mergedOptions.initialFrequency!
			}
		];
	}

	public simulateNextFrequencyPoint(powerImbalance = 0): FrequencyPoint {
		const currentPoint = this.frequencyPoints.at(-1)!;

		const dfImbalance = (currentPoint.frequency * powerImbalance) / this.inertia;
		const dfRandom = this.randomVariations ? (Math.random() - 0.5) * 0.01 : 0;

		const nextPoint = {
			ts: currentPoint.ts + this.resolution,
			frequency: currentPoint.frequency + dfImbalance * (this.resolution / 1000) + dfRandom
		};
		this.frequencyPoints.push(nextPoint);
		return nextPoint;
	}
}
