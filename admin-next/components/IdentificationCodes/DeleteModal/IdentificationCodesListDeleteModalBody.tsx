import { FC } from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { Box, CapUILineHeight, Checkbox, Flex, InfoMessage, Modal, Text } from '@cap-collectif/ui';

const IdentificationCodesListDeleteModalWarningProjects: FC<{
    projectsUsingCodes: Array<string>;
}> = ({ projectsUsingCodes }) => {
    const intl = useIntl();

    return projectsUsingCodes.length > 0 ? (
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
                {projectsUsingCodes.map((project, index) => (
                    <Text key={index.toString()}>- {project}</Text>
                ))}
            </InfoMessage.Content>
        </InfoMessage>
    ) : null;
};

const IdentificationCodesListDeleteModalBody: FC<{
    projectsUsingCodes: Array<string>;
    listName: string;
    understood: boolean;
    setUnderstood: (understood: boolean) => void;
}> = ({ projectsUsingCodes, listName, understood, setUnderstood }) => {
    const intl = useIntl();

    return (
        <Modal.Body>
            <IdentificationCodesListDeleteModalWarningProjects
                projectsUsingCodes={projectsUsingCodes}
            />
            <Text mt={1} mb={2}>
                <FormattedHTMLMessage
                    id="identification-code-delete-warning"
                    values={{ listName: listName }}
                />
            </Text>

            <Checkbox
                id="checkbox-understood-cannot-cancel"
                label={intl.formatMessage({ id: 'understood-cannot-cancel' })}
                onChange={() => {
                    setUnderstood(!understood);
                }}
            />
        </Modal.Body>
    );
};

export default IdentificationCodesListDeleteModalBody;
