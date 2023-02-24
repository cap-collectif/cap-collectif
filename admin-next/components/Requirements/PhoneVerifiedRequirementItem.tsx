import React, {ChangeEvent} from 'react';
import {Checkbox, Flex, Text} from "@cap-collectif/ui";
import {useFormContext} from "react-hook-form";
import {config} from "@components/Requirements/Requirements";
import {useIntl} from "react-intl";

const PhoneVerifiedRequirementItem: React.FC = () => {
    const intl = useIntl();
    const {watch, setValue} = useFormContext();
    const phoneVerifiedIndex = Object.keys(config).findIndex(typename => typename === 'PhoneVerifiedRequirement');
    const key = `requirements.${phoneVerifiedIndex}`;
    const requirement = watch(key);
    const isChecked = requirement ? Object.keys(requirement).length > 0 : false;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const value = isChecked ? {id: requirement?.id ?? '', label: '', typename: 'PHONE_VERIFIED'} : null;
        setValue(key, value);
    }

    return (
        <Flex mt={1}>
            <Checkbox id="phone_verified" checked={isChecked} onChange={onChange} />
            <Text as="label" htmlFor="phone_verified" color="gray.700" ml={1}>{intl.formatMessage({ id: 'activate-sms-verification' })}</Text>
        </Flex>
    );
};

export default PhoneVerifiedRequirementItem;