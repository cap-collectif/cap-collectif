import * as React from 'react';
import { useIntl, IntlShape, FormattedHTMLMessage } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import {
    Flex,
    toast,
    Button,
    Modal,
    Heading,
    Text,
    ButtonGroup,
    Menu,
    CapUIModalSize,
    Checkbox,
} from '@cap-collectif/ui';
import { mutationErrorToast } from 'utils/mutation-error-toast';
import type { ProjectModalConfirmationDelete_project$key } from '@relay/ProjectModalConfirmationDelete_project.graphql';
import DeleteProjectMutation from 'mutations/DeleteProjectMutation';

interface ProjectModalConfirmationDeleteProps {
    project: ProjectModalConfirmationDelete_project$key;
    connectionName: string;
}

const FRAGMENT = graphql`
    fragment ProjectModalConfirmationDelete_project on Project {
        id
        title
        contributions {
            totalCount
        }
    }
`;

const deleteProject = (
    projectId: string,
    hide: () => void,
    intl: IntlShape,
    connectionName: string,
) => {
    const input = {
        id: projectId,
    };
    hide();
    return DeleteProjectMutation.commit({ input, connections: [connectionName] })
        .then(() =>
            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'project-successfully-deleted' }),
            }),
        )
        .catch(() => mutationErrorToast(intl));
};

const ProjectModalConfirmationDelete: React.FC<ProjectModalConfirmationDeleteProps> = ({
    project: projectFragment,
    connectionName,
}) => {
    const project = useFragment(FRAGMENT, projectFragment);
    const intl = useIntl();
    const [confirm, setConfirm] = React.useState<boolean>(false);
    return (
        <Modal
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
            disclosure={
                <Menu.Item closeOnSelect={false}>
                    <Text> {intl.formatMessage({ id: 'admin.global.delete' })} </Text>
                </Menu.Item>
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>{intl.formatMessage({ id: 'project.list.delete' })}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Text marginBottom={4} color="gray.900">
                            <FormattedHTMLMessage
                                id="project.list.delete.modal.body"
                                values={{
                                    project: project.title,
                                    contributions: project.contributions.totalCount,
                                    num: project.contributions.totalCount,
                                }}
                            />
                        </Text>
                        <Checkbox
                            id="isDeleteConfirmed"
                            checked={confirm}
                            onChange={() => setConfirm(!confirm)}>
                            {intl.formatMessage({ id: 'admin.project.delete.confirm' })}
                        </Checkbox>
                    </Modal.Body>
                    <Modal.Footer spacing={2}>
                        <ButtonGroup>
                            <Button
                                variantSize="medium"
                                variant="secondary"
                                variantColor="hierarchy"
                                onClick={hide}>
                                {intl.formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                                disabled={!confirm}
                                variantSize="medium"
                                variant="primary"
                                variantColor="danger"
                                onClick={() =>
                                    deleteProject(project.id, hide, intl, connectionName)
                                }>
                                {intl.formatMessage({ id: 'global.delete' })}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default ProjectModalConfirmationDelete;
