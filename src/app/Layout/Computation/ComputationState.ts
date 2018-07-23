﻿import { AlgorithmType } from "../Types/AlgorithmType";
import { Election } from "../Interfaces/Models";
import { LagueDhontResult } from "../Interfaces/Results";

export interface ComputationState {
    election: Election;
    algorithm: AlgorithmType;
    firstDivisor: number;
    electionThreshold: number;
    districtSeats: number;
    levelingSeats: number;
    results: LagueDhontResult;
}

export const unloadedState: ComputationState = {
    election: {
        countryId: -1,
        electionTypeId: -1,
        electionId: -1,
        counties: [],
        year: -1,
        algorithm: 0,
        firstDivisor: -1,
        threshold: -1,
        seats: -1,
        levelingSeats: -1
    },
    algorithm: AlgorithmType.Undefined,
    firstDivisor: -1,
    electionThreshold: -1,
    districtSeats: -1,
    levelingSeats: -1,
    results: {
        districtResults: [],
        partyResults: [],
        levelingSeatDistribution: []
    }
};
