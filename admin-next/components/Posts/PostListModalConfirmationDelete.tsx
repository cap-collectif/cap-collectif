import * as React from 'react';
import type { IntlShape } from 'react-intl';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { mutationErrorToast } from 'utils/mutation-error-toast';
import DeletePostMutation from 'mutations/DeletePostMutation';
import {
    Button,
    ButtonGroup,
    ButtonQuickAction,
    CapUIIcon,
    CapUIIconSize,
    CapUIModalSize,
    Heading,
    Modal,
    Text,
    toast,
} from '@cap-collectif/ui';
import { PostListModalConfirmationDelete_post$key } from '@relay/PostListModalConfirmationDelete_post.graphql';

export interface PostListModalConfirmationDeleteProps {
    post: PostListModalConfirmationDelete_post$key;
    connectionName: string;
}

const FRAGMENT = graphql`
    fragment PostListModalConfirmationDelete_post on Post {
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

const PostListModalConfirmationDelete: React.FC<PostListModalConfirmationDeleteProps> = ({
    post: postFragment,
    connectionName,
}) => {
    const post = useFragment(FRAGMENT, postFragment);
    const intl = useIntl();
    return (
        <Modal
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
            disclosure={
                <ButtonQuickAction
                    icon={CapUIIcon.Trash}
                    size={CapUIIconSize.Md}
                    variantColor="red"
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

export default PostListModalConfirmationDelete;
