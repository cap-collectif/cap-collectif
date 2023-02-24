import React from 'react';
import {Flex, Switch, Text} from "@cap-collectif/ui";
import {useIntl} from "react-intl";
import {useFormContext} from "react-hook-form";
import {FieldInput} from '@cap-collectif/form';

const CollectStepWithoutAccountRequirements: React.FC = () => {
    const intl = useIntl();
    const {control} = useFormContext();
    return (
        <>
            <Text color="gray.900" mb={4}>{intl.formatMessage({ id: 'additional-options' })}</Text>
            <Flex bg="white" p={4} borderRadius="4px" direction="column">
                <Flex justifyContent="space-between">
                    <Text as="label" fontWeight={600} width="100%" color="blue.900">
                        <Flex justifyContent="space-between">
                            {intl.formatMessage({id: 'collect-particpants-email'})}
                        </Flex>
                    </Text>
                    <FieldInput id="collectParticipantsEmail" type="switch" name="collectParticipantsEmail" control={control} />
                </Flex>
                <Text mt={2} fontSize={1} color="gray.700">{intl.formatMessage({ id: 'collect-particpants-email-help' })}</Text>
            </Flex>
        </>
    );
};

export default CollectStepWithoutAccountRequirements;