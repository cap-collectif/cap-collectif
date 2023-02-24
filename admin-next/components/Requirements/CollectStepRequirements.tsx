import React from 'react';
import {graphql, useFragment} from "react-relay";
import {CollectStepRequirements_collectStep$key} from "@relay/CollectStepRequirements_collectStep.graphql";
import useFeatureFlag from "@hooks/useFeatureFlag";
import {ToggleRequirement} from "@components/Requirements/Requirements";
import {FormProvider, UseFormReturn} from "react-hook-form";
import Requirements from "@components/Requirements/Requirements";

type Props = {
    collectStep: CollectStepRequirements_collectStep$key
    formMethods: UseFormReturn<any>
};

const COLLECT_STEP_FRAGMENT = graphql`
    fragment CollectStepRequirements_collectStep on CollectStep {
        isProposalSmsVoteEnabled
        ...on RequirementStep {
            ...Requirements_requirementStep
        }
    }
`

const CollectStepRequirements: React.FC<Props> = ({collectStep: collectStepRef, formMethods}) => {
    const collectStep = useFragment(COLLECT_STEP_FRAGMENT, collectStepRef);
    const isTwilioEnabled = useFeatureFlag('twilio');
    const isSmsVoteEnabled = useFeatureFlag('proposal_sms_vote');
    const canVoteBySms = isTwilioEnabled && isSmsVoteEnabled;

    const filterRequirements = (requirements: Array<ToggleRequirement>) => {
        return requirements.filter(requirement => {
            if (requirement.typename === 'PhoneVerifiedRequirement' && !canVoteBySms) {
                return false;
            }
            return true;
        });
    }

    return (
        <FormProvider {...formMethods}>
            <Requirements
                modifyRequirementsCallback={filterRequirements}
                requirementStep={collectStep}
            />
        </FormProvider>
    );
};

export default CollectStepRequirements;