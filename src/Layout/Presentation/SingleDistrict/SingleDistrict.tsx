import * as React from "react";
import ReactTable from "react-table";
import { DistrictResult, PartyResult, SeatResult } from "../../../computation/computation-models";
import { toSum } from "../../../utilities/reduce";
import { DisproportionalityIndex } from "../presentation-models";
import { checkExhaustively } from "../../../utilities";
import {
    getVulnerableSeatByQuotient,
    getVulnerableSeatByVotes,
    getVotesToVulnerableSeatMap,
    getQuotientsToVulnerableSeatMap,
} from "../../../utilities/district";
import { DistrictSelect } from "./DistrictSelect";
import { norwegian } from "../../../utilities/rt";
import { roundNumber } from "../../../utilities/number";

export interface SingleDistrictProps {
    districtResults: DistrictResult[];
    districtSelected: string;
    selectDistrict: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    decimals: number;
    disproportionalityIndex: DisproportionalityIndex;
}

export class SingleDistrict extends React.Component<SingleDistrictProps, {}> {
    getDistrictResult = (name: string): DistrictResult => {
        const selectedDistrict =
            this.props.districtResults.find((district) => district.name === name) || this.props.districtResults[0];
        return selectedDistrict;
    };

    getData = (): PartyResult[] => {
        const districtResult = this.getDistrictResult(this.props.districtSelected);
        return districtResult.partyResults;
    };

    render() {
        const data = this.getData()!;
        const decimals = this.props.decimals;
        const proportionalities = data.map((value) => value.proportionality);
        const currentDistrictResult = this.getDistrictResult(this.props.districtSelected);
        const vulnerableMap = getVotesToVulnerableSeatMap(currentDistrictResult!);
        const quotientMap = getQuotientsToVulnerableSeatMap(currentDistrictResult!);
        const vulnerable = getVulnerableSeatByQuotient(currentDistrictResult!);
        const vulnerableVotes = getVulnerableSeatByVotes(currentDistrictResult!);
        let label: string;
        let index: number;
        switch (this.props.disproportionalityIndex) {
            case DisproportionalityIndex.LOOSEMORE_HANBY: {
                label = "L-H";
                index = proportionalities.map((value) => Math.abs(value)).reduce(toSum, 0) / 2;
                break;
            }
            case DisproportionalityIndex.GALLAGHER: {
                label = "LSq";
                index = Math.sqrt(proportionalities.map((value) => value * value).reduce(toSum, 0) / 2);
                break;
            }
            default: {
                checkExhaustively(this.props.disproportionalityIndex);
                label = "Error";
                index = -1;
            }
        }
        const blackBoxComment =
            vulnerable.moreVotesToWin > vulnerableVotes.moreVotesToWin
                ? [
                      " hadde nærmest kvotient. ",
                      <span key={vulnerableVotes.partyCode} className="has-text-warning">
                          {vulnerableVotes.partyCode}
                      </span>,
                      " hadde derimot minst margin og trengte kun ",
                      vulnerableVotes.moreVotesToWin,
                      " flere stemmer for å ta det siste mandatet.",
                  ]
                : [
                      " hadde nærmest kvotient, og trengte ",
                      vulnerable.moreVotesToWin,
                      " flere stemmer for å ta mandatet. ",
                  ];
        return (
            <React.Fragment>
                <DistrictSelect
                    selectDistrict={this.props.selectDistrict}
                    districtSelected={this.props.districtSelected}
                    districtResults={this.props.districtResults}
                />
                <div className="card has-background-dark has-text-light">
                    <div className="card-content">
                        <p>
                            {"Sistemandat i "}
                            {this.props.districtSelected}
                            {" gikk til "}
                            {<span className="has-text-success">{vulnerable.winner.partyCode}</span>}
                            {". "}&nbsp;
                            {<span className="has-text-warning">{vulnerable.runnerUp.partyCode}</span>}
                            {blackBoxComment}
                        </p>
                    </div>
                </div>

                <ReactTable
                    className="-highlight -striped has-text-centered"
                    data={data}
                    pageSize={data.length <= 10 ? data.length : 10}
                    showPagination={data.length > 10}
                    columns={[
                        {
                            Header: "Parti",
                            accessor: "partyCode",
                            Footer: (
                                <span>
                                    <strong>Utvalg</strong>
                                </span>
                            ),
                        },
                        {
                            Header: "Stemmer",
                            accessor: "votes",
                            Footer: (
                                <span>
                                    <strong>{data.map((value) => value.votes).reduce(toSum)}</strong>
                                </span>
                            ),
                        },
                        {
                            Header: "%",
                            id: "%",
                            accessor: (d: PartyResult) => roundNumber(d.percentVotes, decimals),
                        },
                        {
                            Header: "Distrikt",
                            accessor: "districtSeats",
                            Footer: (
                                <span>
                                    <strong>{data.map((value) => value.districtSeats).reduce(toSum)}</strong>
                                </span>
                            ),
                        },
                        {
                            Header: "Utjevning",
                            accessor: "levelingSeats",
                            Footer: (
                                <span>
                                    <strong>{data.map((value) => value.levelingSeats).reduce(toSum)}</strong>
                                </span>
                            ),
                        },
                        {
                            Header: "Sum Mandater",
                            accessor: "totalSeats",
                            Footer: (
                                <span>
                                    <strong>{data.map((value) => value.totalSeats).reduce(toSum)}</strong>
                                </span>
                            ),
                        },
                        {
                            id: "marginInVotes",
                            Header: "Margin i stemmer",
                            accessor: (d: PartyResult) => vulnerableMap.get(d.partyCode),
                            Cell: (row) => {
                                if (row.original.partyCode === vulnerableVotes.partyCode) {
                                    return <div className="has-background-dark has-text-white">{row.value}</div>;
                                }
                                return row.value;
                            },
                        },
                        {
                            id: "lastSeatQuotient",
                            Header: "Siste kvotient",
                            accessor: (d: PartyResult) => quotientMap.get(d.partyCode)!.toFixed(decimals),
                            Cell: (row) => {
                                if (row.original.partyCode === vulnerable.runnerUp.partyCode) {
                                    return <div className="has-background-dark has-text-white">{row.value}</div>;
                                }
                                return row.value;
                            },
                        },
                        {
                            Header: "Prop.",
                            accessor: "proportionality",
                            Footer: (
                                <span>
                                    <strong>
                                        {label}: {index.toFixed(decimals)}
                                    </strong>
                                </span>
                            ),
                        },
                    ]}
                    showPageSizeOptions={false}
                    {...norwegian}
                />
            </React.Fragment>
        );
    }
    getLastSeat = (): SeatResult | undefined => {
        const districtResult = this.getDistrictResult(this.props.districtSelected);
        if (districtResult) {
            return districtResult.districtSeatResult[districtResult.districtSeatResult.length - 1];
        }
        return undefined;
    };
}