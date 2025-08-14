import React, { Suspense } from 'react';
import { Box, Spinner } from '@cap-collectif/ui'
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { graphql, useFragment } from 'react-relay';
import { QuestionnaireStepRequirementsTabs_questionnaireStep$key } from '@relay/QuestionnaireStepRequirementsTabs_questionnaireStep.graphql';
import Requirements from "./Requirements";

type Props = {
  questionnaireStep: QuestionnaireStepRequirementsTabs_questionnaireStep$key
  formMethods: UseFormReturn<any>
}

const QUESTIONNAIRE_STEP_FRAGMENT = graphql`
  fragment QuestionnaireStepRequirementsTabs_questionnaireStep on QuestionnaireStep {
    ... on RequirementStep {
      ...Requirements_requirementStep
    }
  }
`

const QuestionnaireStepRequirementsTabs: React.FC<Props> = ({
  questionnaireStep: questionnaireStepRef,
  formMethods,
}) => {
    const questionnaireStep = useFragment(QUESTIONNAIRE_STEP_FRAGMENT, questionnaireStepRef);

    return (
        <Suspense fallback={<Spinner />}>
            <FormProvider {...formMethods}>
                <Box backgroundColor="gray.100" p={5}>
                    <Requirements
                      requirementStep={questionnaireStep}
                    />
                </Box>
            </FormProvider>
        </Suspense>
    );
};

export default QuestionnaireStepRequirementsTabs
