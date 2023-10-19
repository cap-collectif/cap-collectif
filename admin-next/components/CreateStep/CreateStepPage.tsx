import React, { useEffect, useState } from 'react';
import withPageAuthRequired from '@utils/withPageAuthRequired';
import { Flex, Box, Text, SpotIcon, CapUISpotIcon, Button } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import HelpMessage from '@ui/HelpMessage/HelpMessage';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { CreateStepPageQuery } from '@relay/CreateStepPageQuery.graphql';
import { useNavBarContext } from '@components/NavBar/NavBar.context';
import { getDefaultStepConfig, StepTypeEnum } from '@components/CreateStep/defaultStepConfig';
import { createStep } from '@components/CreateStep/createStep';

export type StepType =
    | 'COLLECT'
    | 'VOTE'
    | 'DEBATE'
    | 'QUESTIONNAIRE'
    | 'CONSULTATION'
    | 'ANALYSIS'
    | 'RESULT'
    | 'CUSTOM';

export type Step = {
    type: StepType,
    heading: string,
    description: string,
    spotIcon: CapUISpotIcon,
    helpText: string,
};

type Props = {
    projectId: string,
};

export const PROJECT_QUERY = graphql`
    query CreateStepPageQuery($id: ID!) {
        project: node(id: $id) {
            ... on Project {
                id
                title
                adminAlphaUrl
                canEdit
                steps {
                    __typename
                }
            }
        }
    }
`;

const CreateStepPage: React.FC<Props> = ({ projectId }) => {
    const intl = useIntl();
    const query = useLazyLoadQuery<CreateStepPageQuery>(PROJECT_QUERY, { id: projectId });
    const { setBreadCrumbItems } = useNavBarContext();
    const project = query?.project;

    const steps = project?.steps;
    const canEdit = project?.canEdit ?? false;
    const hasCollectStep = steps?.some(step => step.__typename === 'CollectStep');

    const breadCrumbItems = [
        {
            title: project?.title ?? '',
            href: project?.adminAlphaUrl ?? '',
        },
        {
            title: intl.formatMessage({ id: 'add-step' }),
            href: '/',
        },
    ];

    useEffect(() => {
        setBreadCrumbItems(breadCrumbItems);
        return () => setBreadCrumbItems([]);
    }, []);

    const [stepHovered, setStepHovered] = useState<StepType | null>(null);

    if (!canEdit) {
        window.location.href = '/admin-next/projects';
        return null;
    }

    const defaultStepsConfig: Array<Step> = getDefaultStepConfig(intl);

    const stepsConfig: Array<Step> = defaultStepsConfig.filter(step => {
        if (!hasCollectStep) {
            return ![StepTypeEnum.VOTE, StepTypeEnum.ANALYSIS, StepTypeEnum.RESULT].includes(
                step.type,
            );
        }
        return true;
    });

    const getCardMarginBottom = (index: number) => {
        if (!hasCollectStep) {
            return 4;
        }
        const lastTwoItemsIndex = stepsConfig.length - 2;
        if (index >= lastTwoItemsIndex) {
            return 0;
        }
        return 4;
    };

    return (
        <Flex>
            <Box bg="white" width="70%" p={6} height="100%" borderRadius="8px">
                <Text fontWeight={600} color="blue.800" fontSize={4}>
                    {intl.formatMessage({ id: 'select-step-type' })}
                </Text>
                <Flex justifyContent="space-between" mt={6} flexWrap="wrap" mb={4}>
                    {stepsConfig.map((step, index) => {
                        return (
                            <Flex
                                onMouseEnter={() => setStepHovered(step.type)}
                                onMouseLeave={() => setStepHovered(null)}
                                onClick={() => createStep(intl, projectId, step.type)}
                                key={step.type}
                                p={4}
                                borderColor={stepHovered === step.type ? 'blue.200' : ''}
                                borderRadius="8px"
                                width="45%"
                                mb={getCardMarginBottom(index)}
                                bg={stepHovered === step.type ? 'blue.100' : ''}
                                sx={{
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'all 0.15s ease-in-out',
                                }}>
                                <SpotIcon name={step.spotIcon} />
                                <Flex direction="column" ml={2}>
                                    <Text color="blue.800" fontSize={3} fontWeight="600">
                                        {step.heading}
                                    </Text>
                                    <Text color="gray.500" fontSize={3} lineHeight="initial">
                                        {step.description}
                                    </Text>
                                </Flex>
                            </Flex>
                        );
                    })}
                </Flex>
                <Button
                    as="a"
                    variant="secondary"
                    variantColor="hierarchy"
                    variantSize="big"
                    href={project?.adminAlphaUrl}>
                    {intl.formatMessage({ id: 'global.back' })}
                </Button>
            </Box>
            <Box
                width="30%"
                ml={4}
                opacity={stepHovered !== null ? 1 : 0}
                sx={{
                    transition: 'all 0.15s ease-in',
                }}>
                <HelpMessage variant="info">
                    {stepsConfig.find(step => step.type === stepHovered)?.helpText}
                </HelpMessage>
            </Box>
        </Flex>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default CreateStepPage;
