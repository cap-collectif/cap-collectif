import React from 'react';
import {Tabs} from "@cap-collectif/ui";
import {FormProvider, UseFormReturn} from "react-hook-form";
import {useIntl} from "react-intl";
import {graphql, useFragment} from "react-relay";
import CollectStepRequirements from "@components/Requirements/CollectStepRequirements";
import {CollectStepRequirementsTabs_collectStep$key} from "@relay/CollectStepRequirementsTabs_collectStep.graphql";
import CollectStepWithoutAccountRequirements from "@components/Requirements/CollectStepWithoutAccountRequirements";
import useFeatureFlag from "@hooks/useFeatureFlag";

type Props = {
    collectStep: CollectStepRequirementsTabs_collectStep$key
    formMethods: UseFormReturn<any>
};

const COLLECT_STEP_FRAGMENT = graphql`
    fragment CollectStepRequirementsTabs_collectStep on CollectStep {
        ...on RequirementStep {
            ...CollectStepRequirements_collectStep
        }
    }
`

const CollectStepRequirementsTabs: React.FC<Props> = ({
                                                          collectStep: collectStepRef,
                                                          formMethods,
                                                      }) => {
    const intl = useIntl();
    const collectStep = useFragment(COLLECT_STEP_FRAGMENT, collectStepRef);

    const isTwilioEnabled = useFeatureFlag('twilio');
    const isProposalSmsVoteFeature = useFeatureFlag('proposal_sms_vote');
    const canVoteAnonymously = isTwilioEnabled && isProposalSmsVoteFeature;

    const {watch, setValue} = formMethods;

    const WITH_ACCOUNT = 'WITH_ACCOUNT';
    const WITHOUT_ACCOUNT = 'WITHOUT_ACCOUNT';
    const isProposalSmsVoteEnabled = watch('isProposalSmsVoteEnabled');
    const voteType = isProposalSmsVoteEnabled ? WITHOUT_ACCOUNT : WITH_ACCOUNT;

    return (
        <FormProvider {...formMethods}>
            <Tabs mb={6} selectedId={voteType} onChange={(selectedTab) => {
                if (selectedTab !== voteType) {
                    const isProposalSmsVoteEnabled = selectedTab === WITHOUT_ACCOUNT;
                    setValue('isProposalSmsVoteEnabled', isProposalSmsVoteEnabled);
                }
            }}>
                <Tabs.ButtonList ariaLabel="debateType">
                    <Tabs.Button id={WITH_ACCOUNT}>{intl.formatMessage({id: 'with-account'})}</Tabs.Button>
                    <Tabs.Button
                        disabled={!canVoteAnonymously}
                        id={WITHOUT_ACCOUNT}>{intl.formatMessage({id: 'without-account'})}</Tabs.Button>
                </Tabs.ButtonList>
                <Tabs.PanelList>
                    <Tabs.Panel>
                        <CollectStepRequirements collectStep={collectStep} formMethods={formMethods}/>
                    </Tabs.Panel>
                    <Tabs.Panel>
                        <CollectStepWithoutAccountRequirements />
                    </Tabs.Panel>
                </Tabs.PanelList>
            </Tabs>
        </FormProvider>
    );
};

export default CollectStepRequirementsTabs;