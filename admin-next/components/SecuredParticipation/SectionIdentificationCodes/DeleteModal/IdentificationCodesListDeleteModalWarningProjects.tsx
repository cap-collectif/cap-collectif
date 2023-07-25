import { FC, useMemo } from 'react';
import {
    getProjectNamesUsingCodes,
    ProjectNamesUsingCodesQuery,
} from './GetProjectNamesUsingCodes';
import { useLazyLoadQuery } from 'react-relay';
import { InfoMessage, Text } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { GetProjectNamesUsingCodesQueryResponse } from '@relay/GetProjectNamesUsingCodesQuery.graphql';

const IdentificationCodesListDeleteModalWarningProjects: FC = () => {
    const intl = useIntl();
    const projects = useLazyLoadQuery(ProjectNamesUsingCodesQuery, {});

    const projectsUsingCodes = useMemo(
        () => getProjectNamesUsingCodes(projects as GetProjectNamesUsingCodesQueryResponse),
        [projects],
    );

    if (projectsUsingCodes.length === 0) return null;

    return (
        <InfoMessage variant="warning" mt={1} mb={2}>
            <InfoMessage.Title withIcon>
                {intl.formatMessage(
                    {
                        id: 'identification-code-requirement-is-active-on-projects',
                    },
                    { count: projectsUsingCodes.length },
                )}
            </InfoMessage.Title>
            <InfoMessage.Content>
                {projectsUsingCodes.map((project, idx) => (
                    <Text key={`project-usingCodes-${idx}`}>- {project}</Text>
                ))}
            </InfoMessage.Content>
        </InfoMessage>
    );
};

export default IdentificationCodesListDeleteModalWarningProjects;
