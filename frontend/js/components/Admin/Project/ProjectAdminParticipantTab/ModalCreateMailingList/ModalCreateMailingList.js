// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, reduxForm, formValueSelector, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import component from '~/components/Form/Field';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import type { Dispatch, GlobalState } from '~/types';
import { Container, InfoContainer, ButtonSave } from './ModalCreateMailingList.style';
import CreateMailingListMutation from '~/mutations/CreateMailingListMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import type { ModalCreateMailingList_project } from '~relay/ModalCreateMailingList_project.graphql';
import CreateEmailingCampaignMutation from '~/mutations/CreateEmailingCampaignMutation';

const formName = 'form-create-mailing-list';

type Props = {|
  ...ReduxFormFormProps,
  show: boolean,
  onClose: () => void,
  members: string[],
  project: ModalCreateMailingList_project,
  mailingListName: string,
  dispatch: Dispatch,
|};

type Values = {|
  mailingListName: string,
|};

const createEmailingCampaign = (mailingListId: string) => {
  return CreateEmailingCampaignMutation.commit({
    input: {
      mailingList: mailingListId,
    },
  })
    .then(response => {
      if (response.createEmailingCampaign?.error) {
        return FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        });
      }

      if (response.createEmailingCampaign?.emailingCampaign?.id) {
        window.location.replace(
          `/admin/mailingCampaign/edit/${response.createEmailingCampaign.emailingCampaign.id}`,
        );
      }
    })
    .catch(() => {
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      });
    });
};

const createMailingList = (
  projectId: string,
  members: string[],
  mailingListName: string,
  onClose: () => void,
  withRedirection?: boolean,
) => {
  return CreateMailingListMutation.commit({
    input: {
      name: mailingListName,
      userIds: members,
      project: projectId,
    },
  })
    .then(response => {
      onClose();

      if (response.createMailingList?.error) {
        return FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        });
      }

      if (withRedirection && response.createMailingList?.mailingList) {
        createEmailingCampaign(response.createMailingList.mailingList.id);
      }

      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.SUCCESS,
          content: 'success-create-mailing-list',
          values: {
            name: response.createMailingList?.mailingList?.name,
          },
          extraContent: (
            <a href="/admin/mailingList/list">
              <FormattedMessage id="action_show" />
            </a>
          ),
        },
      });
    })
    .catch(() => {
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      });
    });
};

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  const { project, onClose, members } = props;
  const { mailingListName } = values;

  createMailingList(project.id, members, mailingListName, onClose, true);
};

const ModalCreateMailingList = ({
  show,
  onClose,
  members,
  project,
  dispatch,
  mailingListName,
  pristine,
}: Props) => (
  <Container
    animation={false}
    show={show}
    onHide={onClose}
    bsSize="large"
    aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">
        <FormattedMessage id="create-mailing-list" />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <form>
        <Field
          type="text"
          name="mailingListName"
          label={<FormattedMessage id="title-list" />}
          component={component}
          id="mailing-list-name"
        />

        <InfoContainer>
          <Icon name={ICON_NAME.newUser} size={14} color="#000" />
          <p>
            <span className="count-members">{members.length}</span>
            <FormattedMessage id="global.members" values={{ num: members.length }} />
          </p>
          <span className="project-title">{` - « ${project.title} »`}</span>
        </InfoContainer>
      </form>
    </Modal.Body>

    <Modal.Footer>
      <ButtonSave
        type="button"
        onClick={() => createMailingList(project.id, members, mailingListName, onClose)}
        disabled={pristine}>
        <FormattedMessage id="global.save" />
      </ButtonSave>

      <div>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton
          label="global.continue"
          onSubmit={() => dispatch(submit(formName))}
          bsStyle="primary"
          disabled={pristine}
        />
      </div>
    </Modal.Footer>
  </Container>
);

const form = reduxForm({
  onSubmit,
  form: formName,
  enableReinitialize: true,
})(ModalCreateMailingList);

const selectorForm = formValueSelector(formName);

const mapStateToProps = (state: GlobalState) => ({
  mailingListName: selectorForm(state, 'mailingListName') || '',
});

const ModalCreateMailingListConnected = connect(mapStateToProps)(form);

export default createFragmentContainer(ModalCreateMailingListConnected, {
  project: graphql`
    fragment ModalCreateMailingList_project on Project {
      id
      title
    }
  `,
});
