import {
    getParticipatoryBudgetAnalysisInput
} from './ConfigureParticipatoryBudgetAnalysisInput';
import { PreConfigureProjectInput } from '@relay/PreConfigureProjectMutation.graphql';

const getParticipatoryBudgetInput = ({ projectTitle, authors, intl }): PreConfigureProjectInput => {
    const { proposalForms, project } = getParticipatoryBudgetAnalysisInput({ projectTitle, authors, intl });

    const updatedInput = {
        proposalForms: [...proposalForms],
        project: {
            ...project,
        },
    };

    return updatedInput;
};

export { getParticipatoryBudgetInput };