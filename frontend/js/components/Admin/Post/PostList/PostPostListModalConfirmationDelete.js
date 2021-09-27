// @flow
import * as React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';
import DeletePostMutation from '~/mutations/DeletePostMutation';
import type { PostPostListModalConfirmationDelete_post$key } from '~relay/PostPostListModalConfirmationDelete_post.graphql';

type Props = {|
  +post: PostPostListModalConfirmationDelete_post$key,
  +connectionName: string,
|};

const FRAGMENT = graphql`
  fragment PostPostListModalConfirmationDelete_post on Post {
    id
    title
  }
`;

const deletePost = (postId: string, hide: () => void, intl: IntlShape, connectionName: string) => {
  const input = {
    id: postId,
  };
  hide();
  return DeletePostMutation.commit({ input, connections: [connectionName] })
    .then(() =>
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'post-successfully-deleted' }),
      }),
    )
    .catch(() => mutationErrorToast(intl));
};

const PostPostListModalConfirmationDelete = ({
  post: postFragment,
  connectionName,
}: Props): React.Node => {
  const post = useFragment(FRAGMENT, postFragment);
  const intl = useIntl();
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <ButtonQuickAction
          icon="TRASH"
          size="md"
          variantColor="danger"
          label={intl.formatMessage({ id: 'admin.global.delete' })}
        />
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
                onClick={() => deletePost(post.id, hide, intl, connectionName)}>
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default PostPostListModalConfirmationDelete;
