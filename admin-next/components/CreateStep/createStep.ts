import {StepType} from "@components/CreateStep/CreateStepPage";
import AddOtherStepMutation from '@mutations/AddOtherStepMutation';
import AddConsultationStepMutation from '@mutations/AddConsultationStepMutation';
import AddQuestionnaireStepMutation from '@mutations/AddQuestionnaireStepMutation';
import AddDebateStepMutation from '@mutations/AddDebateStepMutation';
import AddCollectStepMutation from '@mutations/AddCollectStepMutation';
import { StepTypeEnum } from "./defaultStepConfig";
import AddAnalysisStepMutation from "@mutations/AddAnalysisStepMutation";
import AddResultStepMutation from "@mutations/AddResultStepMutation";
import AddVoteAndSelectionStepMutation from "@mutations/AddVoteAndSelectionStepMutation";

const createStep = async (projectId: string, stepType: StepType) => {
    const input = {
        projectId,
    };
    switch (stepType) {
        case StepTypeEnum.COLLECT: {
            const response = await AddCollectStepMutation.commit({input});
            const adminUrl = response.addCollectStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.VOTE: {
            const response = await AddVoteAndSelectionStepMutation.commit({input});
            const adminUrl = response.addVoteAndSelectionStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.DEBATE: {
            const response = await AddDebateStepMutation.commit({input});
            const adminUrl = response.addDebateStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.QUESTIONNAIRE: {
            const response = await AddQuestionnaireStepMutation.commit({input});
            const adminUrl = response.addQuestionnaireStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.CONSULTATION: {
            const response = await AddConsultationStepMutation.commit({input});
            const adminUrl = response.addConsultationStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.ANALYSIS: {
            const response = await AddAnalysisStepMutation.commit({input});
            const adminUrl = response.addAnalysisStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.RESULT: {
            const response = await AddResultStepMutation.commit({input});
            const adminUrl = response.addResultStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.CUSTOM: {
            const response = await AddOtherStepMutation.commit({input});
            const adminUrl = response.addOtherStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
    }
}

export { createStep }