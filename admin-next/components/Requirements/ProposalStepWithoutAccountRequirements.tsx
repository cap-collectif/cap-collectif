import React from 'react';
import {Flex, Switch, Text} from "@cap-collectif/ui";
import {useIntl} from "react-intl";

const ProposalStepWithoutAccountRequirements: React.FC = () => {
    const intl = useIntl();
    return (
        <>
            <Text color="gray.900" mb={4}>{intl.formatMessage({ id: 'additional-options' })}</Text>
            <Flex bg="white" p={4} borderRadius="4px" justifyContent="space-between">
                <Text as="label" fontWeight={600} width="100%" color="blue.900">
                    <Flex justifyContent="space-between">
                        {intl.formatMessage({id: 'phone-number-verified-by-sms'})}
                    </Flex>
                </Text>
                <Switch
                    id={'phone-number-verified-by-sms'}
                    checked
                    disabled
                />
            </Flex>
        </>
    );
};

export default ProposalStepWithoutAccountRequirements;