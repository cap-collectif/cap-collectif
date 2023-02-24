import React from 'react';
import {FormProvider, UseFormReturn} from "react-hook-form";
import Requirements, {ToggleRequirement} from "@components/Requirements/Requirements";
import {graphql, useFragment} from "react-relay";
import {QuestionnaireStepRequirements_questionnaireStep$key} from "@relay/QuestionnaireStepRequirements_questionnaireStep.graphql";

type Props = {
    questionnaireStep: QuestionnaireStepRequirements_questionnaireStep$key
    formMethods: UseFormReturn<any>
};

const QUESTIONNAIRE_STEP_FRAGMENT = graphql`
    fragment QuestionnaireStepRequirements_questionnaireStep on QuestionnaireStep {
        ...on RequirementStep {
            ...Requirements_requirementStep
        }
    }
`

const QuestionnaireStepRequirements: React.FC<Props> = ({questionnaireStep: questionnaireStepRef, formMethods}) => {
    const questionnaireStep = useFragment(QUESTIONNAIRE_STEP_FRAGMENT, questionnaireStepRef);

    const filterRequirements = (requirements: Array<ToggleRequirement>) => {
        return requirements.filter(requirement => {
            return requirement.typename !== 'PhoneVerifiedRequirement';
        });
    }

    return (
        <FormProvider {...formMethods}>
            <Requirements
                modifyRequirementsCallback={filterRequirements}
                requirementStep={questionnaireStep}
            />
        </FormProvider>
    );
};

export default QuestionnaireStepRequirements;