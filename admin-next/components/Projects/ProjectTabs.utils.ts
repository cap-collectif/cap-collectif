import { ProjectTabs_project } from '@relay/ProjectTabs_project.graphql';
import { fromGlobalId } from '@utils/fromGlobalId';

export const getProjectAdminBaseUrl = (projectId: string, isAdminNext: boolean = false) =>
    isAdminNext ? `/admin-next/project/${projectId}` : `/admin/alpha/project/${projectId}`;
type ProjectRoute = {
    CONFIGURATION: string;
    ANALYSIS: string;
    CONTRIBUTIONS: string;
    PARTICIPANTS: string;
};
const PROJECT_ROUTE: ProjectRoute = {
    CONTRIBUTIONS: '/contributions',
    PARTICIPANTS: '/participants',
    ANALYSIS: '/analysis',
    CONFIGURATION: '/edit',
};

export const getProjectAdminPath = (projectId: string, type: keyof ProjectRoute): string => {
    switch (type) {
        case 'CONTRIBUTIONS':
            return `${getProjectAdminBaseUrl(fromGlobalId(projectId).id)}${
                PROJECT_ROUTE.CONTRIBUTIONS
            }`;
        case 'PARTICIPANTS':
            return `${getProjectAdminBaseUrl(fromGlobalId(projectId).id)}${
                PROJECT_ROUTE.PARTICIPANTS
            }`;
        case 'ANALYSIS':
            return `${getProjectAdminBaseUrl(fromGlobalId(projectId).id)}${PROJECT_ROUTE.ANALYSIS}`;
        case 'CONFIGURATION':
            return `${getProjectAdminBaseUrl(projectId, true)}`;
        default:
            return getProjectAdminBaseUrl(projectId);
    }
};

export type ProjectAdminPageStatus = 'ready' | 'loading';

export const getContributionsPath = (
    baseUrl: string,
    type: string,
    stepId?: string,
    stepSlug?: string | null,
) => {
    switch (type) {
        case 'CollectStep':
        case 'SelectionStep':
            return `${baseUrl}/proposals${stepId ? `?step=${encodeURIComponent(stepId)}` : ''}`;
        case 'DebateStep':
            return `${baseUrl}/debate/${stepSlug || ':stepSlug'}`;
        case 'QuestionnaireStep':
            return `${baseUrl}/questionnaire/${stepSlug || ':stepSlug'}`;
        default:
            return baseUrl;
    }
};
export const getRouteContributionPath = (
    project: ProjectTabs_project,
    baseUrlContributions: string,
    firstCollectStepId?: string,
): string => {
    const collectSteps = project.steps.filter(step => step.__typename === 'CollectStep');
    const debateSteps = project.steps.filter(step => step.__typename === 'DebateStep');
    const questionnaireSteps = project.steps.filter(
        step => step.__typename === 'QuestionnaireStep',
    );

    const hasCollectStep = collectSteps.length > 0;
    const hasDebateStep = debateSteps.length > 0;
    const hasquestionnaireSteps = questionnaireSteps.length > 0;

    const onlyDebateStep =
        !hasCollectStep &&
        !hasquestionnaireSteps &&
        debateSteps.length === 1 &&
        !!project.firstDebateStep;
    const onlyCollectStep =
        !hasDebateStep && !hasquestionnaireSteps && collectSteps.length === 1 && firstCollectStepId;
    const onlyQuestionnaireStep =
        !hasCollectStep &&
        !hasDebateStep &&
        questionnaireSteps.length === 1 &&
        !!project.firstQuestionnaireStep;

    if (onlyCollectStep && firstCollectStepId) {
        return getContributionsPath(baseUrlContributions, 'CollectStep', firstCollectStepId);
    }

    if (onlyDebateStep && project.firstDebateStep) {
        return getContributionsPath(
            baseUrlContributions,
            'DebateStep',
            project.firstDebateStep.id,
            project.firstDebateStep.slug,
        );
    }

    if (onlyQuestionnaireStep && project.firstQuestionnaireStep) {
        return getContributionsPath(
            baseUrlContributions,
            'QuestionnaireStep',
            project.firstQuestionnaireStep.id,
            project.firstQuestionnaireStep.slug,
        );
    }

    return baseUrlContributions;
};
