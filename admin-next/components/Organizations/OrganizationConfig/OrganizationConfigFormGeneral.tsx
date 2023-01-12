import * as React from 'react';
import { Control } from 'react-hook-form';
import { FormValues } from './OrganizationConfigForm';
import { Card, Flex, FormLabel, Heading, Text } from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useIntl } from 'react-intl';
import debounce from '@utils/debounce-promise';
import UpdateOrganizationMutation from '@mutations/UpdateOrganizationMutation';
import { graphql, useFragment } from 'react-relay';
import { OrganizationConfigFormGeneral_organization$key } from '@relay/OrganizationConfigFormGeneral_organization.graphql';
import { OrganizationConfigFormGeneral_query$key } from '@relay/OrganizationConfigFormGeneral_query.graphql';
import { mutationErrorToast } from 'utils/mutation-error-toast';

export interface OrganizationConfigFormGeneralProps {
    control: Control<FormValues>;
    organization: OrganizationConfigFormGeneral_organization$key;
    query: OrganizationConfigFormGeneral_query$key;
}

const ORGANIZATION_FRAGMENT = graphql`
    fragment OrganizationConfigFormGeneral_organization on Organization {
        id
    }
`;

const QUERY_FRAGMENT = graphql`
    fragment OrganizationConfigFormGeneral_query on Query {
        availableLocales(includeDisabled: false) {
            code
            isDefault
            traductionKey
        }
    }
`;

const OrganizationConfigFormGeneral: React.FC<OrganizationConfigFormGeneralProps> = ({
    control,
    organization: organizationRef,
    query: queryRef,
}) => {
    const intl = useIntl();
    const organization = useFragment(ORGANIZATION_FRAGMENT, organizationRef);
    const query = useFragment(QUERY_FRAGMENT, queryRef);
    const defaultLocale = query.availableLocales.find(locale => locale.isDefault);

    const onTitleChange = debounce(async (title: string) => {
        try {
            await UpdateOrganizationMutation.commit({
                input: {
                    organizationId: organization?.id || '',
                    translations: [{ title, locale: defaultLocale?.code ?? 'FR_FR' }],
                },
            });
        } catch (error) {
            return mutationErrorToast(intl);
        }
    }, 400);

    return (
        <Flex
            as={Card}
            direction="column"
            spacing={8}
            style={{
                borderRadius: '8px',
                border: 'none',
            }}
            backgroundColor="white">
            <Heading as="h4" fontWeight="semibold" color="blue.800">
                {intl.formatMessage({ id: 'global.general' })}
            </Heading>
            <Flex direction="column" spacing={6} mt={6}>
                <FormControl name="title" control={control} isRequired mb={0}>
                    <FormLabel
                        htmlFor="title"
                        label={intl.formatMessage({ id: 'organisation.form.name' })}
                    />
                    <FieldInput
                        onChange={event => {
                            onTitleChange(event.target.value);
                        }}
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
