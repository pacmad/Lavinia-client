﻿import { RequestedDataActionType, RequestedDataAction } from "./requested-data-actions";
import { RequestedDataState, unloadedState } from "./requested-data-state";
import { GlobalActionType } from "../reducers/global-actions";
import { checkExhaustively } from "../utilities";

function checkStateLoaded(state: RequestedDataState, action: RequestedDataAction): boolean {
    return (
        (state.metrics.length > 0 || action.type === RequestedDataActionType.INITIALIZE_REQUESTED_METRICS) &&
        (state.parameters.length > 0 || action.type === RequestedDataActionType.INITIALIZE_REQUESTED_PARAMETERS) &&
        (state.votes.length > 0 || action.type === RequestedDataActionType.INITIALIZE_REQUESTED_VOTES) &&
        (Object.keys(state.partyMap).length > 0 ||
            action.type === RequestedDataActionType.INITIALIZE_REQUESTED_PARTY_MAP)
    );
}

/**
 *
 * @param state - the current state, with default parameters iff it is
 * undefined.
 * @param action - the action to act upon the state.
 * @returns a new state mutated by the action passed in as parameter.
 */
export function requestedData(
    state: RequestedDataState = unloadedState,
    action: RequestedDataAction
): RequestedDataState {
    switch (action.type) {
        case RequestedDataActionType.INITIALIZE_REQUESTED_VOTES:
            return {
                ...state,
                votes: action.votes,
                dataLoaded: checkStateLoaded(state, action),
                enableAutoSave: checkStateLoaded(state, action),
            };
        case RequestedDataActionType.INITIALIZE_REQUESTED_METRICS:
            return {
                ...state,
                metrics: action.metrics,
                dataLoaded: checkStateLoaded(state, action),
                enableAutoSave: checkStateLoaded(state, action),
            };
        case RequestedDataActionType.INITIALIZE_REQUESTED_PARAMETERS:
            return {
                ...state,
                parameters: action.parameters,
                dataLoaded: checkStateLoaded(state, action),
                enableAutoSave: checkStateLoaded(state, action),
            };
        case RequestedDataActionType.INITIALIZE_REQUESTED_PARTY_MAP:
            return {
                ...state,
                partyMap: action.partyMap,
                dataLoaded: checkStateLoaded(state, action),
                enableAutoSave: checkStateLoaded(state, action),
            };
        case GlobalActionType.CLEAR_STATE:
            return unloadedState;
        default:
            checkExhaustively(action);
            return state;
    }
}
