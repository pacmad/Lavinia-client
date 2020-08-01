import * as React from "react";
import { VulnerableDistrictSeat } from "../../../utilities/district";
import { Dictionary } from "lodash";

export interface VulnerableDistrictSeatTextProps {
    mostVulnerable?: VulnerableDistrictSeat | undefined;
    partyMap: Dictionary<string>;
}

export class VulnerableDistrictSeatText extends React.Component<VulnerableDistrictSeatTextProps, {}> {
    render() {
        if (this.props.mostVulnerable) {
            const partyMap = this.props.partyMap;
            const winnerPartyCode = this.props.mostVulnerable.winner.partyCode;
            const runnerUpPartyCode = this.props.mostVulnerable.runnerUp.partyCode;
            return (
                <React.Fragment>
                    {" Det mest utsatte sistemandatet (relativt til kvotient) var i "}
                    {this.props.mostVulnerable.district}
                    {" og ble vunnet av "}
                    <b>{partyMap[winnerPartyCode]}</b>
                    {". "}
                    <b>{partyMap[runnerUpPartyCode]}</b>
                    {" ville trengt "}
                    {this.props.mostVulnerable.moreVotesToWin.toFixed(0)}
                    {" flere stemmer for å vinne det."}
                </React.Fragment>
            );
        } else {
            return null;
        }
    }
}
