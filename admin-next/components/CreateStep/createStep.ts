import {StepType} from "@components/CreateStep/CreateStepPage";
import {IntlShape} from "react-intl";
import AddOtherStepMutation from '@mutations/AddOtherStepMutation';
import AddConsultationStepMutation from '@mutations/AddConsultationStepMutation';
import AddQuestionnaireStepMutation from '@mutations/AddQuestionnaireStepMutation';
import AddDebateStepMutation from '@mutations/AddDebateStepMutation';
import AddSelectionStepMutation from '@mutations/AddSelectionStepMutation';
import AddCollectStepMutation from '@mutations/AddCollectStepMutation';
import { StepTypeEnum } from "./defaultStepConfig";

const createStep = async (intl: IntlShape, projectId: string, stepType: StepType) => {
    const input = {
        title: '',
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
            const response = await AddSelectionStepMutation.commit({input});
            const adminUrl = response.addSelectionStep?.step?.adminUrl;
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
            const response = await AddSelectionStepMutation.commit({input});
            const adminUrl = response.addSelectionStep?.step?.adminUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
            break;
        }
        case StepTypeEnum.RESULT: {
            const response = await AddSelectionStepMutation.commit({input});
            const adminUrl = response.addSelectionStep?.step?.adminUrl;
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