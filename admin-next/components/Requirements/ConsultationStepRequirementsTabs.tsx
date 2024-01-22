import React from 'react';
import { Tabs } from '@cap-collectif/ui';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { ConsultationStepRequirementsTabs_consultationStep$key } from '@relay/ConsultationStepRequirementsTabs_consultationStep.graphql';
import Requirements from "./Requirements";

type Props = {
    consultationStep: ConsultationStepRequirementsTabs_consultationStep$key;
    formMethods: UseFormReturn<any>;
};

const CONSULTATION_STEP_FRAGMENT = graphql`
    fragment ConsultationStepRequirementsTabs_consultationStep on ConsultationStep {
        ... on RequirementStep {
            ...Requirements_requirementStep
        }
    }
`;

const ConsultationStepRequirementsTabs: React.FC<Props> = ({
    consultationStep: consultationStepRef,
    formMethods,
}) => {
    const intl = useIntl();
    const consultationStep = useFragment(CONSULTATION_STEP_FRAGMENT, consultationStepRef);

    const WITH_ACCOUNT = 'WITH_ACCOUNT';
    const WITHOUT_ACCOUNT = 'WITHOUT_ACCOUNT';

    return (
        <FormProvider {...formMethods}>
            <Tabs mb={6} selectedId={WITH_ACCOUNT}>
                <Tabs.ButtonList ariaLabel="consultation-tabs">
                    <Tabs.Button id={WITH_ACCOUNT}>
                        {intl.formatMessage({ id: 'with-account' })}
                    </Tabs.Button>
                    <Tabs.Button disabled id={WITHOUT_ACCOUNT}>
                        {intl.formatMessage({ id: 'without-account' })}
                    </Tabs.Button>
                </Tabs.ButtonList>
                <Tabs.PanelList>
                    <Tabs.Panel>
                        <Requirements
                          requirementStep={consultationStep}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel></Tabs.Panel>
                </Tabs.PanelList>
            </Tabs>
        </FormProvider>
    );
};

export default ConsultationStepRequirementsTabs;
