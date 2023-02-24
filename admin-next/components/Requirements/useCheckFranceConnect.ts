import {Requirement, RequirementApiTypeName, RequirementTypeName} from "@components/Requirements/Requirements";
import {useFormContext} from "react-hook-form";
import {useFranceConnectRequirement} from "@components/Requirements/useFranceConnectRequirement";
import React from "react";
import useFeatureFlag from "@hooks/useFeatureFlag";

type Params = {
    index: number
    typename: RequirementTypeName
    id: string
    apiTypename: RequirementApiTypeName
    setDisabled: (disabled: boolean) => void
}

// when FranceConnect is checked automatically check data collected by FranceConnect
export const useCheckFranceConnect = ({index, typename, setDisabled, id, apiTypename}: Params) => {
    const isFCEnabled = useFeatureFlag('login_franceconnect');
    const {watch, setValue} = useFormContext();
    const {collectedFcData} = useFranceConnectRequirement();

    if (!isFCEnabled) return null;

    if (!collectedFcData.includes(typename)) return null;

    const requirements = watch('requirements') as Array<Requirement>;
    const franceConnectIndex = requirements.findIndex((requirement) => requirement?.typename === 'FRANCE_CONNECT');
    const franceConnect = (franceConnectIndex > -1) ? watch(`requirements.${franceConnectIndex}`) : null;
    const isDataCollectedByFranceConnect = !!franceConnect && collectedFcData.includes(typename);

    React.useEffect(() => {
        const value = isDataCollectedByFranceConnect ? {id, label: '', typename: apiTypename} : {};
        setValue(`requirements.${index}`, value);
        setDisabled(isDataCollectedByFranceConnect);
    }, [isDataCollectedByFranceConnect]);

    return isDataCollectedByFranceConnect;
}