// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useDisclosure } from '@liinkiing/react-hooks';
import { Modal, Button } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import DeleteVersionMutation from '../../../mutations/DeleteVersionMutation';
import DeleteOpinionMutation from '../../../mutations/DeleteOpinionMutation';
import type { OpinionDelete_opinion } from '~relay/OpinionDelete_opinion.graphql';
import type { GlobalState } from '~/types';
import type { User } from '~/redux/modules/user';

type Props = {|
  +opinion: OpinionDelete_opinion,
  +user: User,
|};

const OpinionDelete = ({ opinion, user }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const isTheUserTheAuthor = opinion.author && user ? user.uniqueId === opinion.author.slug : false;

  const deleteOpinion = () => {
    setIsSubmitting(true);
    if (opinion.__typename === 'Version') {
      const input = { versionId: opinion.id };
      DeleteVersionMutation.commit({ input }).then(() => {
        window.location.href = opinion.section.url;
      });
    }
    if (opinion.__typename === 'Opinion') {
      const input = { opinionId: opinion.id };
      DeleteOpinionMutation.commit({ input }).then(() => {
        window.location.href = opinion.section.url;
      });
    }
  };

  return isTheUserTheAuthor ? (
    <div>
      <Button
        id="opinion-delete"
        className="pull-right btn--outline btn-danger"
        onClick={onOpen}
        style={{ marginLeft: '5px' }}>
        <i className="cap cap-bin-2" /> <FormattedMessage id="global.delete" />
      </Button>
      <Modal
        animation={false}
        show={isOpen}
        onHide={onClose}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="global.removeMessage" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedHTMLMessage id="proposal.delete.confirm" tagName="p" />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-opinion-delete"
            isSubmitting={isSubmitting}
            onSubmit={deleteOpinion}
            label="global.removeDefinitively"
            bsStyle="danger"
          />
        </Modal.Footer>
      </Modal>
    </div>
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  user: state.user.user,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(OpinionDelete);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionDelete_opinion on OpinionOrVersion {
      ... on Opinion {
        __typename
        id
        author {
          slug
        }
        section {
          url
        }
      }
      ... on Version {
        __typename
        id
        author {
          slug
        }
        section {
          url
        }
      }
    }
  `,
});
