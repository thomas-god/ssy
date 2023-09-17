import type { FrequencyPoint } from './SimulateFrequency';

export interface FRRReserveOptions {
	maxReserve?: number;
	resolution?: number;
	responseDelay?: number;
	alpha?: number;
}

const defaultOptions: FRRReserveOptions = {
	maxReserve: 0.02,
	resolution: 50,
	responseDelay: 180_000,
	alpha: 80
};

export class FRRReserve {
	private readonly frequencyReference = 50;
	private readonly frequencyPoints: FrequencyPoint[] = [];
	private readonly nLevel: number[];
	private readonly maxReserve: number;
	private readonly resolution: number;
	private readonly timeDeltaToConsider: number;
	private readonly alpha: number;
	private readonly windowSize: number;

	constructor(options?: FRRReserveOptions) {
		const mergedOptions = {
			...defaultOptions,
			...options
		};

		this.maxReserve = mergedOptions.maxReserve!;
		this.resolution = mergedOptions.resolution!;
		this.timeDeltaToConsider = mergedOptions.responseDelay!;
		this.alpha = mergedOptions.alpha!;
		this.windowSize = Math.floor(this.timeDeltaToConsider / this.resolution);
		this.nLevel = new Array(this.windowSize).fill(0);
	}

	public computePowerCorrection(frequencyPoint: FrequencyPoint): number {
		this.computeNLevel(frequencyPoint);
		const averageNLevel = this.nLevel.reduce((acc, nLevel) => acc + nLevel, 0) / this.nLevel.length;
		return averageNLevel * this.maxReserve;
	}

	private computeNLevel(frequencyPoint: FrequencyPoint) {
		this.updateFrequencyPoints(frequencyPoint);
		const totalFrequencyDelta = this.frequencyPoints.reduce(
			(acc, point) => acc + (this.frequencyReference - point.frequency) * (50 / 1000),
			0
		);
		const nLevel = Math.max(-1, Math.min(1, this.alpha * totalFrequencyDelta));
		this.nLevel.shift();
		this.nLevel.push(nLevel);
	}

	private updateFrequencyPoints(frequencyPoint: FrequencyPoint) {
		this.frequencyPoints.push(frequencyPoint);
		if (this.frequencyPoints.length > this.windowSize) {
			this.frequencyPoints.shift();
		}
	}
}
