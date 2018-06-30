﻿import * as React from "react";
import { PresentationType } from "../Types/PresentationType";
import { LagueDhontResult, PartyResult, DistrictResult } from "../Interfaces/Results";
import { ElectionOverview, DistrictOverview, SeatsPerParty, SeatDistribution } from "./Views";
import {
    getDistrictTableData,
    getPartyTableData,
    getSeatDistributionData,
    getSeatsPerPartyData
} from "./Utilities/PresentationUtilities";

export interface PresentationProps {
    currentPresentation: PresentationType;
    decimals: number;
    showPartiesWithoutSeats: boolean;
    results: LagueDhontResult;
}

export class PresentationComponent extends React.Component<PresentationProps, {}> {
    getPartyTableData(): PartyResult[] {
        return getPartyTableData(
            this.props.results.partyResults,
            this.props.showPartiesWithoutSeats,
            this.props.decimals
        );
    }

    getDistrictTableData(): DistrictResult[] {
        return getDistrictTableData(this.props.results.districtResults, this.props.decimals);
    }

    getSeatDistributionData(): DistrictResult[] {
        return getSeatDistributionData(
            this.props.results.districtResults,
            this.props.results.partyResults,
            this.props.showPartiesWithoutSeats
        );
    }

    getSeatsPerPartyData(): PartyResult[] {
        return getSeatsPerPartyData(this.props.results.partyResults, this.props.showPartiesWithoutSeats);
    }

    render() {
        switch (this.props.currentPresentation) {
            case PresentationType.ElectionTable:
                return <ElectionOverview partyResults={this.getPartyTableData()} />;
            case PresentationType.DistrictTable:
                return <DistrictOverview districtResults={this.getDistrictTableData()} />;
            case PresentationType.SeatDistribution:
                return <SeatDistribution districtResults={this.getSeatDistributionData()} />;
            case PresentationType.SeatsPerParty:
                return <SeatsPerParty partyResults={this.getSeatsPerPartyData()} />;
            default:
                console.log(`Could not find presentation type ${this.props.currentPresentation}`);
                return <g />;
        }
    }
}
