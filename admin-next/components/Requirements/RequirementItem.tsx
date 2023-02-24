import React, {ChangeEvent} from 'react';
import {Flex, Switch, Text} from '@cap-collectif/ui'
import {useIntl} from "react-intl";
import {config, RequirementTypeName} from "../Requirements/Requirements";
import {useFormContext} from "react-hook-form";
import {useCheckFranceConnect} from "@components/Requirements/useCheckFranceConnect";

type Props = {
    id: string
    index: number
    typename: RequirementTypeName
    disabled: boolean
    onChange?: ({ isChecked }: {isChecked: boolean}) => void
};

const RequirementItem: React.FC<Props> = ({
    id = '',
    index,
    typename,
    disabled: disabledDefault = false,
    onChange: onChangeCallback,
    children
}) => {
    const intl = useIntl();
    const [disabled, setDisabled] = React.useState(() => disabledDefault);
    const {setValue, watch} = useFormContext();

    const apiTypename = config[typename].apiTypename;
    const title = config[typename].title;

    const isDataCollectedByFranceConnect = useCheckFranceConnect({index, typename, setDisabled, id, apiTypename});

    const requirementKey = `requirements.${index}`;
    const requirement = watch(requirementKey);
    const isChecked = requirement ? Object.keys(requirement).length > 0 : false;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const value = isChecked ? {id, label: '', typename: apiTypename} : {};
        setValue(requirementKey, value);
        if (onChangeCallback) {
            onChangeCallback({isChecked})
        }
    }

    return (
        <Flex bg="white" direction="column" p={4} borderRadius="4px">
            <Flex justifyContent="space-between" >
                <Text as="label" htmlFor={typename} fontWeight={600} width="100%" color="blue.900">
                    <Flex justifyContent="space-between">
                        {intl.formatMessage({id: title})}
                        {
                            isDataCollectedByFranceConnect && (
                                <Text as="span" mr={4} fontSize={1} color="gray.400" >{intl.formatMessage({ id: 'data-collected-by-france-connect' })}</Text>
                            )
                        }
                    </Flex>
                </Text>
                <Switch
                    id={typename}
                    checked={isChecked}
                    onChange={onChange}
                    disabled={disabled}
                />
            </Flex>
            {children}
        </Flex>
    );
};

export default RequirementItem;