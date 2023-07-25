import { graphql } from 'react-relay';
import { GetProjectNamesUsingCodesQueryResponse } from '@relay/GetProjectNamesUsingCodesQuery.graphql';

type RequirementEdge = {
    node: {
        __typename: string;
    };
};

type Step = {
    state: string;
    requirements: {
        edges: Array<RequirementEdge>;
    };
};

type ProjectEdge = {
    node: {
        title: string;
        steps: Array<Step>;
    };
};

const isCodeRequirement = (requirementEdge: RequirementEdge): boolean => {
    return requirementEdge.node.__typename === 'IdentificationCodeRequirement';
};

const isStepUsingCodes = (step: Step): boolean => {
    return step.state === 'OPENED' && step.requirements?.edges.some(isCodeRequirement);
};

const isProjectEdgeUsingCodes = (projectEdge: ProjectEdge): boolean => {
    return projectEdge.node.steps.some(isStepUsingCodes);
};

export const getProjectNamesUsingCodes = (
    response: GetProjectNamesUsingCodesQueryResponse,
): string[] => {
    return (
        response.viewer.projects.edges
            // @ts-ignore fixme
            .filter(isProjectEdgeUsingCodes)
            // @ts-ignore fixme
            .map((edge: ProjectEdge) => edge?.node.title)
    );
};

export const ProjectNamesUsingCodesQuery = graphql`
    query GetProjectNamesUsingCodesQuery {
        viewer {
            projects(orderBy: { field: PUBLISHED_AT, direction: DESC }) {
                totalCount
                edges {
                    node {
                        title
                        steps {
                            state
                            ... on RequirementStep {
                                requirements {
                                    edges {
                                        node {
                                            __typename
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
