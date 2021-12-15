// @flow
import * as React from 'react';
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Field, reduxForm, submit } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import toggle from '~/components/Form/Toggle';
import renderInput from '~/components/Form/Field';
import ChangeProposalPublicationStatusMutation from '~/mutations/ChangeProposalPublicationStatusMutation';
import { ModalDeleteProposalContainer } from './ModalDeleteProposal.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import type { ProjectAdminPageParameters } from '~/components/Admin/Project/ProjectAdminPage.reducer';
import type { ModalDeleteProposal_proposal } from '~relay/ModalDeleteProposal_proposal.graphql';

const formName = 'form-proposal-trash';

type Values = {|
  isHidden?: boolean,
  trashedReason: string,
|};

type Props = {|
  ...ReduxFormFormProps,
  proposal: ModalDeleteProposal_proposal,
  parentConnectionId: string,
  onClose: () => void,
  show: boolean,
  onSubmit: () => void,
  parametersConnection: ProjectAdminPageParameters,
  isAnalysis?: boolean,
|};

const onSubmit = (
  values: Values,
  dispatch,
  { proposal, onClose, parametersConnection, isAnalysis, parentConnectionId }: Props,
) => {
  const input = {
    proposalId: proposal.id,
    publicationStatus: values.isHidden ? 'TRASHED_NOT_VISIBLE' : 'TRASHED',
    trashedReason: values.trashedReason || undefined,
  };

  ChangeProposalPublicationStatusMutation.commit({
    input,
    viewerIsAdmin: true,
    author: proposal.author,
    parametersConnection,
    parentConnectionId,
    isAnalysis,
  });
  onClose();
};

const ModalDeleteProposal = ({ onClose, show, handleSubmit, dispatch }: Props) => {
  const intl = useIntl();
  return (
    <ModalDeleteProposalContainer
      animation={false}
      show={show}
      onHide={onClose}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg"
      dialogClassName="modal-delete-proposal-dialog">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="move.contribution.to.trash" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formName} onSubmit={handleSubmit}>
          <Field
            bold
            className="hide-content"
            component={toggle}
            name="isHidden"
            id="toggle-isVisible"
            normalize={val => !!val}
            label={
              <div>
                <FormattedMessage id="toggle.hide.content" />

                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="tooltip-description" className="text-left">
                      {intl.formatMessage({ id: 'tooltip.explanation.hide.content' })}
                    </Tooltip>
                  }>
                  <Icon
                    name={ICON_NAME.information}
                    size={12}
                    color={colors.iconGrayColor}
                    className="ml-5"
                  />
                </OverlayTrigger>
              </div>
            }
          />

          <Field
            type="textarea"
            rows={4}
            name="trashedReason"
            component={renderInput}
            label={
              <div>
                <FormattedMessage id="proposal.show.trashed.reason" />
                <span className="excerpt inline">
                  {intl.formatMessage({ id: 'global.optional' })}
                </span>
              </div>
            }
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />

        <Button type="submit" bsStyle="danger" onClick={() => dispatch(submit(formName))}>
          <FormattedMessage id="move.contribution.to.trash" />
        </Button>
      </Modal.Footer>
    </ModalDeleteProposalContainer>
  );
};

const form = reduxForm({
  onSubmit,
  form: formName,
})(ModalDeleteProposal);

export default createFragmentContainer(form, {
  proposal: graphql`
    fragment ModalDeleteProposal_proposal on Proposal {
      id
      author {
        id
        isEmailConfirmed
        email
        isViewer
      }
    }
  `,
});
