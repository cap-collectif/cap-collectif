import * as React from 'react';
import { Control } from 'react-hook-form';
import { FormValues } from './OrganizationConfigForm';
import { Card, Flex, FormGuideline, FormLabel, Heading, Text } from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useIntl } from 'react-intl';

export interface OrganizationConfigFormGeneralProps {
    control: Control<FormValues>;
}

const OrganizationConfigFormGeneral: React.FC<OrganizationConfigFormGeneralProps> = ({
    control,
}) => {
    const intl = useIntl();
    return (
        <Flex
            as={Card}
            direction="column"
            spacing={8}
            backgroundColor="white"
            borderRadius={'accordion'}
            borderColor="none">
            <Heading as="h4" fontWeight="semibold" color="blue.800">
                {intl.formatMessage({ id: 'global.general' })}
            </Heading>
            <Flex direction="column" spacing={6}>
                <FormControl name="title" control={control} isRequired>
                    <FormLabel
                        htmlFor="title"
                        label={intl.formatMessage({ id: 'organisation.form.name' })}
                    />
                    <FieldInput
                        id="title"
                        name="title"
                        control={control}
                        type="text"
                        maxLength={140}
                        placeholder={intl.formatMessage({
                            id: 'admiun.project.create.title.placeholder',
                        })}
                    />
                </FormControl>
                <FormControl name="body" control={control}>
                    <FormLabel
                        htmlFor="body"
                        label={intl.formatMessage({ id: 'organisation.description' })}>
                        <Text fontSize={2} color="gray.500">
                            {intl.formatMessage({ id: 'global.optional' })}
                        </Text>
                    </FormLabel>

                    <FieldInput
                        id="body"
                        name="body"
                        control={control}
                        type="textarea"
                        maxLength={280}
                        placeholder={intl.formatMessage({
                            id: 'admiun.project.create.title.placeholder',
                        })}
                    />
                </FormControl>
            </Flex>
        </Flex>
    );
};

export default OrganizationConfigFormGeneral;
