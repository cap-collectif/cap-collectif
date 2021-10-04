// @flow
import * as React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import DeletePostMutation from '~/mutations/DeletePostMutation';
import type { ModalPostDeleteConfirmation_post$key } from '~relay/ModalPostDeleteConfirmation_post.graphql';
import { baseUrl } from '~/config';

type Props = {|
  +post: ?ModalPostDeleteConfirmation_post$key,
|};

const FRAGMENT = graphql`
  fragment ModalPostDeleteConfirmation_post on Post {
    id
    title
  }
`;

const deletePost = (postId: string, hide: () => void, intl: IntlShape) => {
  const input = {
    id: postId,
  };
  hide();
  return DeletePostMutation.commit({ input, connections: [] })
    .then(() => window.open(`${baseUrl}/admin/capco/app/post/list`, '_self'))
    .catch(() => mutationErrorToast(intl));
};

const ModalPostDeleteConfirmation = ({ post: postFragment }: Props): React.Node => {
  const post = useFragment(FRAGMENT, postFragment);
  const intl = useIntl();
  if (!post) {
    return null;
  }
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <Button variant="secondary" variantColor="danger" variantSize="small">
          {intl.formatMessage({ id: 'admin.global.delete' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              {intl.formatMessage(
                { id: 'are-you-sure-to-delete-something' },
                { element: post.title },
              )}
            </Text>
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
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() => deletePost(post.id, hide, intl)}>
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default ModalPostDeleteConfirmation;
