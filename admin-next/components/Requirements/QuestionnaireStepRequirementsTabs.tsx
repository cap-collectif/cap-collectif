import React, { Suspense } from 'react';
import { Spinner, Tabs } from '@cap-collectif/ui';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import QuestionnaireStepRequirements from '@components/Requirements/QuestionnaireStepRequirements';
import { QuestionnaireStepRequirementsTabs_questionnaireStep$key } from '@relay/QuestionnaireStepRequirementsTabs_questionnaireStep.graphql';
import QuestionnaireStepWithoutAccountRequirements from '@components/Requirements/QuestionnaireStepWithoutAccountRequirements';

type Props = {
    questionnaireStep: QuestionnaireStepRequirementsTabs_questionnaireStep$key,
    formMethods: UseFormReturn<any>,
};

const COLLECT_STEP_FRAGMENT = graphql`
    fragment QuestionnaireStepRequirementsTabs_questionnaireStep on QuestionnaireStep {
        ... on RequirementStep {
            ...QuestionnaireStepRequirements_questionnaireStep
        }
    }
`;

const QuestionnaireStepRequirementsTabs: React.FC<Props> = ({
    questionnaireStep: questionnaireStepRef,
    formMethods,
}) => {
    const intl = useIntl();
    const questionnaireStep = useFragment(COLLECT_STEP_FRAGMENT, questionnaireStepRef);

    const { watch, setValue } = formMethods;

    const WITH_ACCOUNT = 'WITH_ACCOUNT';
    const WITHOUT_ACCOUNT = 'WITHOUT_ACCOUNT';
    const isAnonymousParticipationAllowed = watch('isAnonymousParticipationAllowed');
    const voteType = isAnonymousParticipationAllowed ? WITHOUT_ACCOUNT : WITH_ACCOUNT;

    return (
        <Suspense fallback={<Spinner />}>
            <FormProvider {...formMethods}>
                <Tabs
                    mb={6}
                    selectedId={voteType}
                    onChange={selectedTab => {
                        if (selectedTab !== voteType) {
                            const isAnonymousParticipationAllowed = selectedTab === WITHOUT_ACCOUNT;
                            setValue(
                                'isAnonymousParticipationAllowed',
                                isAnonymousParticipationAllowed,
                            );
                        }
                    }}>
                    <Tabs.ButtonList ariaLabel="debateType">
                        <Tabs.Button id={WITH_ACCOUNT}>
                            {intl.formatMessage({ id: 'with-account' })}
                        </Tabs.Button>
                        <Tabs.Button id={WITHOUT_ACCOUNT}>
                            {intl.formatMessage({ id: 'without-account' })}
                        </Tabs.Button>
                    </Tabs.ButtonList>
                    <Tabs.PanelList>
                        <Tabs.Panel>
                            <QuestionnaireStepRequirements
                                questionnaireStep={questionnaireStep}
                                formMethods={formMethods}
                            />
                        </Tabs.Panel>
                        <Tabs.Panel>
                            <QuestionnaireStepWithoutAccountRequirements />
                        </Tabs.Panel>
                    </Tabs.PanelList>
                </Tabs>
            </FormProvider>
        </Suspense>
    );
};

export default QuestionnaireStepRequirementsTabs;
