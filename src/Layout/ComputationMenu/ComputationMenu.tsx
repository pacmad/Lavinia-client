import * as React from "react";
import { SmartNumericInput, SmartNumericInputWithLabel, TooltipInfo } from "../../common";
import { ElectionType, Election, Votes, Metrics, Parameters } from "../../requested-data/requested-data-models";
import { ComputationPayload, AlgorithmType, unloadedParameters } from "../../computation";
import { ComputationMenuPayload } from "./computation-menu-models";
import { YearSelect } from "./YearSelect";
import { AlgorithmSelect } from "./AlgorithmSelect";
import { AutoComputeCheckbox } from "./AutoComputeCheckbox";
import { ResetButton } from "./ResetButton";
import { ComparisonOptions } from "./ComparisonOptions";
import { ComputeManuallyButton } from "./ComputeManuallyButton";
import {
    mergeElectionDistricts,
    districtMap,
    mergeVoteDistricts,
    mergeMetricDistricts,
} from "../../computation/logic/district-merging";
import { shouldDistributeDistrictSeats } from "../../utilities/conditionals";
import { isLargestFractionAlgorithm } from "../../computation/logic";

export interface ComputationMenuProps {
    electionType: ElectionType;
    votes: Votes[];
    metrics: Metrics[];
    parameters: Parameters[];
    settingsPayload: ComputationMenuPayload;
    computationPayload: ComputationPayload;
    updateCalculation: (computationPayload: ComputationPayload, autoCompute: boolean, forceCompute: boolean) => any;
    updateSettings: (settingsPayload: ComputationMenuPayload) => any;
    toggleAutoCompute: (autoCompute: boolean) => any;
    resetToHistoricalSettings: (
        settingsPayload: ComputationMenuPayload,
        election: Election,
        votes: Votes[],
        metrics: Metrics[],
        parameters: Parameters
    ) => any;
    resetHistorical: (election: Election, votes: Votes[], metrics: Metrics[], parameters: Parameters) => void;
    resetComparison: () => void;
    saveComparison: () => void;
    showComparison: boolean;
    mergeDistricts: boolean;
    use2021Distribution: boolean;
}

export class ComputationMenu extends React.Component<ComputationMenuProps, {}> {
    /**
     * Helper function to determine whether the first divisor SmartNumericInput
     * should be visible.
     *
     * @returns true if it should be hidden, false if it should not
     */
    shouldHideFirstDivisor(): boolean {
        return (
            this.props.computationPayload.algorithm === AlgorithmType.D_HONDT ||
            isLargestFractionAlgorithm(this.props.computationPayload.algorithm)
        );
    }

    /**
     * Helper function to update the calculation and settings on user
     * interaction.
     *
     * @param event a ChangeEvent whose target carries the stringified year
     */
    onYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextYear = parseInt(event.target.value);
        let election = this.props.electionType.elections.find((election) => election.year === nextYear);
        let votes = this.props.votes.filter((vote) => vote.electionYear === nextYear);
        const distributionYear = this.props.use2021Distribution && nextYear >= 2005 ? 2021 : nextYear;
        let metrics = this.props.metrics.filter((metric) => metric.electionYear === distributionYear);
        const parameters =
            this.props.parameters.find((parameter) => parameter.electionYear === nextYear) || unloadedParameters;

        if (election !== undefined) {
            if (shouldDistributeDistrictSeats(nextYear) && this.props.mergeDistricts) {
                election = mergeElectionDistricts(election, districtMap);
                votes = mergeVoteDistricts(votes, districtMap);
                metrics = mergeMetricDistricts(metrics, districtMap);
            }

            this.props.updateCalculation(
                {
                    ...this.props.computationPayload,
                    election,
                    metrics,
                    votes,
                    parameters,
                },
                this.props.settingsPayload.autoCompute,
                false
            );
            this.props.resetHistorical(election, votes, metrics, parameters);
            this.props.resetComparison();
            this.props.resetToHistoricalSettings(
                {
                    ...this.props.settingsPayload,
                    year: event.target.value,
                },
                election,
                votes,
                metrics,
                parameters
            );
        }
    };

    /**
     * Helper function to update the calculation and settings on user
     * interaction.
     *
     * @param event a ChangeEvent whose target carries the numerified algorithm
     */
    onAlgorithmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const algorithmType = event.target.value as AlgorithmType;
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                algorithm: algorithmType,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
        this.props.updateSettings({
            ...this.props.settingsPayload,
            algorithm: algorithmType,
        });
    };

    /**
     * Helper function to update the calculation and settings on
     * user interaction.
     *
     * @param stringValue the string value of the first divisor
     * @param numericValue the numeric value of the first divisor
     */
    onFirstDivisorChange = (stringValue: string, numericValue: number) => {
        this.props.updateSettings({
            ...this.props.settingsPayload,
            firstDivisor: stringValue,
        });
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                firstDivisor: numericValue,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
    };

    /**
     * Helper function to update the calculation and settings on
     * user interaction.
     *
     * @param stringValue the string value of the threshold
     * @param numericValue the numeric value of the threshold
     */
    onThresholdChange = (stringValue: string, numericValue: number) => {
        this.props.updateSettings({
            ...this.props.settingsPayload,
            electionThreshold: stringValue,
        });
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                electionThreshold: numericValue,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
    };

    /**
     * Helper function to update the calculation and settings on
     * user interaction.
     *
     * @param stringValue the string value of the district threshold
     * @param numericValue the numeric value of the district threshold
     */
    onDistrictThresholdChange = (stringValue: string, numericValue: number) => {
        this.props.updateSettings({
            ...this.props.settingsPayload,
            districtThreshold: stringValue,
        });
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                districtThreshold: numericValue,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
    };

    /**
     * Helper function to update the calculation and settings on
     * user interaction.
     *
     * @param stringValue the string value of the no. of district seats
     * @param numericValue the numeric value of the no. of district seats
     */
    onDistrictSeatsChange = (stringValue: string, numericValue: number) => {
        this.props.updateSettings({
            ...this.props.settingsPayload,
            districtSeats: stringValue,
        });
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                districtSeats: numericValue,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
    };

    /**
     * Helper function to update the calculation and settings on
     * user interaction.
     *
     * @param stringValue the string value of the no. of levelling seats
     * @param numericValue the numeric value of the no. of levelling seats
     */
    onLevelingSeatsChange = (stringValue: string, numericValue: number) => {
        this.props.updateSettings({
            ...this.props.settingsPayload,
            levelingSeats: stringValue,
        });
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                levelingSeats: numericValue,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
    };

    /**
     * Helper function to update the calculation and settings on user
     * interaction.
     *
     * @param stringValue the string value of the area factor
     * @param numericValue the numeric value of the area factor
     */
    onAreaFactorChange = (stringValue: string, numericValue: number) => {
        this.props.updateSettings({
            ...this.props.settingsPayload,
            areaFactor: stringValue,
        });
        this.props.updateCalculation(
            {
                ...this.props.computationPayload,
                areaFactor: numericValue,
            },
            this.props.settingsPayload.autoCompute,
            false
        );
    };

    /**
     * Helper function to update whether or not automatic computation is
     * enabled. Ensures computation is performed whenever toggled.
     *
     * @param event ChangeEvent for whether or not it is checked
     */
    toggleAutoCompute = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.toggleAutoCompute(event.target.checked);
        this.computeManually();
    };

    /**
     * Helper function to perform a manual computation of the current values.
     *
     */
    computeManually = () => {
        const year = parseInt(this.props.settingsPayload.year);
        const election = this.props.electionType.elections.find((e) => e.year === year);
        const votes = this.props.votes.filter((vote) => vote.electionYear === year);
        const distributionYear = this.props.use2021Distribution && year >= 2005 ? 2021 : year;
        const metrics = this.props.metrics.filter((metric) => metric.electionYear === distributionYear);
        const parameters =
            this.props.parameters.find((parameter) => parameter.electionYear === year) || unloadedParameters;
        if (election !== undefined && election !== null) {
            this.props.updateCalculation(
                {
                    election,
                    algorithm: this.props.settingsPayload.algorithm,
                    firstDivisor: parseFloat(this.props.settingsPayload.firstDivisor),
                    electionThreshold: parseFloat(this.props.settingsPayload.electionThreshold),
                    districtThreshold: parseFloat(this.props.settingsPayload.districtThreshold),
                    districtSeats: parseInt(this.props.settingsPayload.districtSeats),
                    levelingSeats: parseInt(this.props.settingsPayload.levelingSeats),
                    areaFactor: parseFloat(this.props.settingsPayload.areaFactor),
                    votes,
                    metrics,
                    parameters,
                },
                this.props.settingsPayload.autoCompute,
                true
            );
        }
    };

    /**
     * Helper function for restoring both the settings and the computation to
     * their original, default state for the current year selected.
     */
    restoreToDefault = () => {
        const compPayload = this.props.computationPayload;
        this.props.resetToHistoricalSettings(
            this.props.settingsPayload,
            compPayload.election,
            compPayload.votes,
            compPayload.metrics,
            compPayload.parameters
        );
    };

    render() {
        const year = parseInt(this.props.settingsPayload.year);
        return (
            <div>
                <h1 className="is-size-6-mobile is-size-4-tablet is-size-2-desktop is-size-1-widescreen">
                    Stortingsvalg
                </h1>
                <form>
                    <AutoComputeCheckbox
                        autoCompute={this.props.settingsPayload.autoCompute}
                        computeManually={this.computeManually}
                        toggleAutoCompute={this.toggleAutoCompute}
                    />
                    <YearSelect
                        electionYears={this.props.settingsPayload.electionYears}
                        onYearChange={this.onYearChange}
                        year={this.props.settingsPayload.year}
                    />
                    <AlgorithmSelect
                        algorithm={this.props.settingsPayload.algorithm}
                        onAlgorithmChange={this.onAlgorithmChange}
                    />
                    <SmartNumericInput
                        hidden={this.shouldHideFirstDivisor()}
                        name="firstDivisor"
                        title="Første delingstall"
                        value={this.props.settingsPayload.firstDivisor}
                        onChange={this.onFirstDivisorChange}
                        min={1}
                        max={5}
                        defaultValue={this.props.computationPayload.election.firstDivisor}
                        integer={false}
                        tooltip={
                            <TooltipInfo
                                text={"Her kan du forandre det første delingstallet i Sainte-Laguës metode."}
                            />
                        }
                    />
                    <SmartNumericInputWithLabel
                        name="electionThreshold"
                        title="Sperregrense"
                        value={this.props.settingsPayload.electionThreshold}
                        onChange={this.onThresholdChange}
                        min={0}
                        max={15}
                        defaultValue={this.props.computationPayload.election.threshold}
                        integer={false}
                        label={"%"}
                        tooltip={
                            <TooltipInfo
                                text={
                                    "For å være med i konkurransen om utjevningsmandater må partiene komme over sperregrensen (prosent av stemmene på landsbasis)."
                                }
                            />
                        }
                    />
                    <SmartNumericInputWithLabel
                        name="districtThreshold"
                        title="Sperregrense for distriktmandat"
                        value={this.props.settingsPayload.districtThreshold}
                        onChange={this.onDistrictThresholdChange}
                        min={0}
                        max={15}
                        defaultValue={0}
                        integer={false}
                        label={"%"}
                        isHiddenTouch={true}
                        tooltip={
                            <TooltipInfo
                                text={
                                    "Denne sperregrensen gjelder i det enkelte valgdistrikt, dvs. ved beregningen av distriktsmandater."
                                }
                            />
                        }
                    />
                    <SmartNumericInput
                        name="levelingSeats"
                        title="Utjevningsmandater"
                        value={this.props.settingsPayload.levelingSeats}
                        onChange={this.onLevelingSeatsChange}
                        min={0}
                        max={100}
                        defaultValue={this.props.computationPayload.election.levelingSeats}
                        integer={true}
                        tooltip={
                            <TooltipInfo
                                text={
                                    "Utjevningsmandatene går til de partiene som har kommet dårligere ut av distriktsfordelingen enn deres stemmeandel skulle tilsi."
                                }
                            />
                        }
                    />
                    <SmartNumericInput
                        name="districtSeats"
                        title="Distriktsmandater"
                        value={this.props.settingsPayload.districtSeats}
                        onChange={this.onDistrictSeatsChange}
                        min={0}
                        max={500}
                        defaultValue={this.props.computationPayload.election.seats}
                        integer={true}
                        hidden={!shouldDistributeDistrictSeats(year)}
                        tooltip={
                            <TooltipInfo
                                text={
                                    "Stortinget består av i alt 169 representanter der 150 mandater fordeles distriktsvis."
                                }
                            />
                        }
                    />
                    <SmartNumericInput
                        name="areaFactor"
                        title="Arealfaktor"
                        value={this.props.settingsPayload.areaFactor}
                        onChange={this.onAreaFactorChange}
                        min={0}
                        max={3}
                        defaultValue={this.props.computationPayload.parameters.areaFactor}
                        integer={false}
                        hidden={!shouldDistributeDistrictSeats(year)}
                        tooltip={
                            <TooltipInfo
                                text={
                                    "Jo høyere arealfaktor, jo større vekt tillegges fylkets geografiske utstrekning."
                                }
                            />
                        }
                    />
                    <ComputeManuallyButton
                        autoCompute={this.props.settingsPayload.autoCompute}
                        computeManually={this.computeManually}
                    />

                    <ResetButton restoreToDefault={this.restoreToDefault} />
                    <ComparisonOptions
                        showComparison={this.props.showComparison}
                        resetComparison={this.props.resetComparison}
                        saveComparison={this.props.saveComparison}
                    />
                </form>
            </div>
        );
    }
}
