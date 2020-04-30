import * as React from "react";
import ReactTable, { Column } from "react-table";
import { LevelingSeat, DistrictResult, DistrictQuotients, AlgorithmType } from "../../../computation";
import { norwegian } from "../../../utilities/rt";

export interface RemainderQuotientsProps {
    districtResults: DistrictResult[];
    levellingSeats: LevelingSeat[];
    finalQuotients: DistrictQuotients[];
    year: number;
    decimals: number;
    showPartiesWithoutSeats: boolean;
    algorithm: AlgorithmType;
}

/**
 * Iterates through districtResults to flatten and filter it into a more
 * table-friendly form specific to RemainderQuotients
 *
 * @param districtResults results of a computation having been run on an
 * election
 * @returns an array of data representing the last remainder from a Sainte-Lagüe,
 * D'Hondt, Largest fraction (Hare) or Largest fraction (Droop) calculation in a given district for a given party,
 * and whether or not they won a levelling seat in that district-party
 */
export class RemainderQuotients extends React.Component<RemainderQuotientsProps> {
    makeData(): DistrictQuotients[] {
        const wonSeat: Set<string> = new Set();
        const modified = this.props.districtResults;
        let modifiedQuotients: DistrictQuotients[] = [];
        if (!this.props.showPartiesWithoutSeats) {
            modified.forEach((result) => {
                result.partyResults
                    .filter((result) => result.totalSeats > 0)
                    .forEach((result) => {
                        wonSeat.add(result.partyCode);
                    });
            });

            this.props.finalQuotients.forEach((district) => {
                const districtQuotients: DistrictQuotients = {
                    district: district.district,
                    levellingSeatRounds: district.levellingSeatRounds.filter((party) => wonSeat.has(party.partyCode)),
                };
                modifiedQuotients.push(districtQuotients);
            });
        } else {
            modifiedQuotients = this.props.finalQuotients;
        }

        return modifiedQuotients;
    }

    getColumns(): Column[] {
        const data = this.makeData();
        const columns: Column[] = [];

        for (let i = 0; i < data[0].levellingSeatRounds.length; i++) {
            const element = data[0].levellingSeatRounds[i];
            columns.push({
                Header: element.partyCode,
                accessor: `levellingSeatRounds[${i}]`,
                minWidth: 50,
                Cell: (row) => {
                    if (row.value !== undefined) {
                        let quotient = row.value.quotient;
                        if (
                            this.props.year < 2005 &&
                            this.props.algorithm !== AlgorithmType.LARGEST_FRACTION_DROOP &&
                            this.props.algorithm !== AlgorithmType.LARGEST_FRACTION_HARE
                        ) {
                            quotient = quotient / 10000;
                        } else if (
                            this.props.year >= 2005 &&
                            (this.props.algorithm === AlgorithmType.LARGEST_FRACTION_DROOP ||
                                this.props.algorithm === AlgorithmType.LARGEST_FRACTION_HARE)
                        ) {
                            quotient = quotient * 10000;
                        }
                        return (
                            <div
                                className={row.value.wonLevellingSeat ? "has-background-dark has-text-white" : ""}
                                style={
                                    {
                                        /* textAlign: "center",
                                    color: row.value.wonLevellingSeat ? "white" : "black",
                                    backgroundColor: row.value.wonLevellingSeat ? "#ff6e00" : "white", */
                                    }
                                }
                            >
                                {Number(quotient).toFixed(this.props.decimals)}
                            </div>
                        );
                    } else {
                        return (
                            <div
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                {(0).toFixed(this.props.decimals)}
                            </div>
                        );
                    }
                },
                sortable: false,
            });
        }
        columns.sort((a: Column, b: Column) => {
            if (typeof a.Header === "string" && typeof b.Header === "string") {
                return a.Header.localeCompare(b.Header);
            } else {
                return 0;
            }
        });
        columns.unshift({
            Header: "Fylker",
            accessor: "district",
        });

        return columns;
    }

    getAdjustment(year: number, algorithm: AlgorithmType) {
        if (
            year < 2005 &&
            algorithm !== AlgorithmType.LARGEST_FRACTION_DROOP &&
            algorithm !== AlgorithmType.LARGEST_FRACTION_HARE
        ) {
            return " er delt på 10 000 og ";
        } else if (
            year >= 2005 &&
            (algorithm === AlgorithmType.LARGEST_FRACTION_DROOP || algorithm === AlgorithmType.LARGEST_FRACTION_HARE)
        ) {
            return " er ganget med 10 000 og ";
        }

        return " ";
    }

    render() {
        const data = this.makeData();

        return (
            <React.Fragment>
                <div className="card has-background-dark has-text-light">
                    <p className="card-content">
                        Markerte celler indikerer at partiet har vunnet et utjevningsmandat i det korresponderende
                        fylket. Kvotientene
                        {this.getAdjustment(this.props.year, this.props.algorithm)}
                        representerer verdien ved utdeling av siste distriktsmandat i fylket for det respektive partiet.
                    </p>
                </div>

                <ReactTable
                    className="has-text-centered"
                    data={data}
                    columns={this.getColumns()}
                    defaultPageSize={10}
                    showPageSizeOptions={false}
                    {...norwegian}
                />
            </React.Fragment>
        );
    }
}
