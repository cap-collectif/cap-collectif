import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Flex, Heading, FormLabel, Text, Switch } from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useIntl } from 'react-intl';
import useFeatureFlag from '@hooks/useFeatureFlag';

const ProjectConfigFormExternal: React.FC = () => {
    const intl = useIntl();
    const external_project = useFeatureFlag('external_project');

    const { watch, setValue, control } = useFormContext();

    const isExternal = watch('isExternal');

    if (!external_project) return null;

    return (
        <Flex direction="column" bg="white" borderRadius="accordion" p={6} mt={6}>
            <Flex justify="space-between" alignItems="center" mb={isExternal ? 4 : 0}>
                <Heading as="h4" color="blue.800" fontWeight={600}>
                    {intl.formatMessage({ id: 'admin.fields.project.group_external' })}
                </Heading>
                <Switch
                    id="isExternal"
                    checked={isExternal}
                    onChange={() => setValue('isExternal', !isExternal)}
                />
            </Flex>
            {isExternal ? (
                <Flex direction="column">
                    <FormControl name="externalLink" control={control}>
                        <FormLabel
                            htmlFor="externalLink"
                            label={intl.formatMessage({
                                id: 'admin.fields.project.externalLink',
                            })}
                        />
                        <FieldInput
                            name="externalLink"
                            control={control}
                            type="text"
                            required={isExternal}
                            placeholder="https://"
                        />
                    </FormControl>
                    <FormControl name="externalParticipantsCount" control={control}>
                        <FormLabel
                            label={intl.formatMessage({
                                id: 'admin.fields.project.participantsCount',
                            })}
                            htmlFor="externalParticipantsCount">
                            <Text fontSize={2} color="gray.500">
                                {intl.formatMessage({ id: 'global.optional' })}
                            </Text>
                        </FormLabel>
                        <FieldInput
                            width="100%"
                            name="externalParticipantsCount"
                            control={control}
                            type="number"
                            min={0}
                        />
                    </FormControl>
                    <FormControl name="externalContributionsCount" control={control}>
                        <FormLabel
                            label={intl.formatMessage({
                                id: 'project.sort.contributions_nb',
                            })}
                            htmlFor="externalContributionsCount">
                            <Text fontSize={2} color="gray.500">
                                {intl.formatMessage({ id: 'global.optional' })}
                            </Text>
                        </FormLabel>
                        <FieldInput
                            width="100%"
                            name="externalContributionsCount"
                            control={control}
                            type="number"
                            min={0}
                        />
                    </FormControl>
                    <FormControl name="externalVotesCount" control={control}>
                        <FormLabel
                            label={intl.formatMessage({
                                id: 'global.vote.count.label',
                            })}
                            htmlFor="externalVotesCount">
                            <Text fontSize={2} color="gray.500">
                                {intl.formatMessage({ id: 'global.optional' })}
                            </Text>
                        </FormLabel>
                        <FieldInput
                            width="100%"
                            name="externalVotesCount"
                            control={control}
                            type="number"
                            min={0}
                        />
                    </FormControl>
                </Flex>
            ) : null}
        </Flex>
    );
};

export default ProjectConfigFormExternal;
