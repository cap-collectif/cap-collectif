import * as React from 'react';
import { Accordion, CapUIAccordionSize } from '@cap-collectif/ui';
import { ProjectConfigFormSide_query$key } from '@relay/ProjectConfigFormSide_query.graphql';
import { ProjectConfigFormSide_project$key } from '@relay/ProjectConfigFormSide_project.graphql';
import { graphql, useFragment } from 'react-relay';
import ProjectConfigFormParameters from './ProjectConfigFormParameters';
import ProjectConfigFormAccess from './ProjectConfigFormAccess';
import ProjectConfigFormPublication from './ProjectConfigFormPublication';
import ProjectConfigFormExternal from './ProjectConfigFormExternal';
import { useIntl } from 'react-intl';

export interface ProjectConfigFormSideProps {
    query: ProjectConfigFormSide_query$key;
    project: ProjectConfigFormSide_project$key;
}

const QUERY_FRAGMENT = graphql`
    fragment ProjectConfigFormSide_query on Query {
        viewer {
            isAdmin
        }
        availableLocales(includeDisabled: false) {
            value: id
            label: traductionKey
        }
    }
`;

const PROJECT_FRAGMENT = graphql`
    fragment ProjectConfigFormSide_project on Project {
        ...ProjectConfigFormPublication_project
    }
`;

const ProjectConfigFormSide: React.FC<ProjectConfigFormSideProps> = ({
    query: queryRef,
    project: projectRef,
}) => {
    const intl = useIntl();
    const query = useFragment(QUERY_FRAGMENT, queryRef);
    const project = useFragment(PROJECT_FRAGMENT, projectRef);

    const locales = query.availableLocales.map(u => ({
        value: u.value,
        label: intl.formatMessage({ id: u.label }),
    }));

    return (
        <>
            <Accordion allowMultiple size={CapUIAccordionSize.Sm}>
                <Accordion.Item id="publication" position="relative">
                    <ProjectConfigFormPublication locales={locales} project={project} />
                </Accordion.Item>
                <Accordion.Item id="access">
                    <ProjectConfigFormAccess isAdmin={query?.viewer?.isAdmin || false} />
                </Accordion.Item>
                <Accordion.Item id="parameters">
                    <ProjectConfigFormParameters />
                </Accordion.Item>
            </Accordion>
            <ProjectConfigFormExternal />
        </>
    );
};

export default ProjectConfigFormSide;
