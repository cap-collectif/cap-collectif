import {
    getParticipatoryBudgetAnalysisInput
} from './ConfigureParticipatoryBudgetAnalysisInput';
import { PreConfigureProjectInput } from '@relay/PreConfigureProjectMutation.graphql';

const getParticipatoryBudgetInput = ({ projectTitle, authors, intl }): PreConfigureProjectInput => {
    const { proposalForms, project } = getParticipatoryBudgetAnalysisInput({ projectTitle, authors, intl });
    const updatedProject = {
        ...project,
        steps: [...project.steps].filter(step => step.label !== intl.formatMessage({ id: 'proposal_form.admin.evaluation' })),
    };

    const updatedInput = {
        proposalForms: [...proposalForms],
        project: {
            ...updatedProject,
        },
    };

    return updatedInput;
};

export { getParticipatoryBudgetInput };