// @flow
import * as React from 'react';
import { useIntl, type IntlShape, FormattedHTMLMessage } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';
import MenuListItem from '~ds/Menu/MenuListItem';
import type { ProjectModalConfirmationDelete_project$key } from '~relay/ProjectModalConfirmationDelete_project.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import DeleteProjectMutation from '~/mutations/DeleteProjectMutation';

type Props = {|
  +project: ProjectModalConfirmationDelete_project$key,
  +connectionName: string,
|};

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

const ProjectModalConfirmationDelete = ({
  project: projectFragment,
  connectionName,
}: Props): React.Node => {
  const project = useFragment(FRAGMENT, projectFragment);
  const intl = useIntl();
  const [confirm, setConfirm] = React.useState<boolean>(false);
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <MenuListItem closeOnSelect={false}>
          <Text> {intl.formatMessage({ id: 'admin.global.delete' })} </Text>
        </MenuListItem>
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
            <Flex direction="row" spacing={2} align="center">
              <input
                id="isDeleteConfirmed"
                name="isDeleteConfirmed"
                value={confirm}
                onChange={() => {
                  setConfirm(!confirm);
                }}
                type="checkbox"
              />
              <label
                htmlFor="isDeleteConfirmed"
                style={{ fontWeight: 400, marginBottom: '0px !important' }}>
                {intl.formatMessage({ id: 'admin.project.delete.confirm' })}
              </label>
            </Flex>
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
                onClick={() => deleteProject(project.id, hide, intl, connectionName)}>
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
