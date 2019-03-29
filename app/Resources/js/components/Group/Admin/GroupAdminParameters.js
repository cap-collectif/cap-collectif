// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, ButtonToolbar } from 'react-bootstrap';
import type { GroupAdminParameters_group } from '~relay/GroupAdminParameters_group.graphql';
import AlertForm from '../../Alert/AlertForm';
import DeleteGroupMutation from '../../../mutations/DeleteGroupMutation';
import SubmitButton from '../../Form/SubmitButton';
import type { Dispatch, GlobalState } from '../../../types';
import UpdateGroupMutation from '../../../mutations/UpdateGroupMutation';
import GroupForm from '../GroupForm';
import DeleteModal from '../../Modal/DeleteModal';

type State = { showDeleteModal: boolean };
type RelayProps = {|
  group: GroupAdminParameters_group,
|};

type Props = {|
  ...RelayProps,
  group: GroupAdminParameters_group,
  submitting: boolean,
  submit: Function,
  invalid: boolean,
  pristine: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
|};

type FormValues = Object;
const formName = 'group-edit';

const onDelete = (groupId: string) =>
  DeleteGroupMutation.commit({
    input: {
      groupId,
    },
  }).then(() => {
    window.location.href = `${window.location.protocol}//${
      window.location.host
    }/admin/capco/app/group/list`;
  });

const validate = ({ title }) => {
  const errors = {};
  if (!title || title.length === 0) {
    errors.title = 'global.constraints.notBlank';
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, { group }: Props) => {
  const input = { ...values, groupId: group.id };

  return UpdateGroupMutation.commit({ input });
};

export class GroupAdminParameters extends React.Component<Props, State> {
  state = {
    showDeleteModal: false,
  };

  openDeleteModal = () => {
    this.setState({ showDeleteModal: true });
  };

  cancelCloseDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  };

  render() {
    const {
      submitting,
      submit,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      pristine,
    } = this.props;
    const { showDeleteModal } = this.state;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header  pl-0">
          <h3 className="box-title">
            <FormattedMessage id="group.admin.parameters" />
          </h3>
        </div>
        <div className="box-content">
          <GroupForm />

          <DeleteModal
            closeDeleteModal={this.cancelCloseDeleteModal}
            showDeleteModal={showDeleteModal}
            deleteElement={() => {
              onDelete(this.props.group.id);
            }}
            deleteModalTitle="group.admin.parameters.modal.delete.title"
            deleteModalContent="group.admin.parameters.modal.delete.content"
            buttonConfirmMessage="group.admin.parameters.modal.delete.button"
          />

          <ButtonToolbar className="box-content__toolbar mb-15">
            <SubmitButton
              id="confirm-group-edit"
              isSubmitting={submitting}
              disabled={pristine || invalid || submitting}
              label="global.save"
              onSubmit={() => {
                submit(formName);
              }}
            />
            <Button bsStyle="danger" onClick={this.openDeleteModal}>
              <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
            </Button>
            <AlertForm
              valid={valid}
              invalid={invalid}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(GroupAdminParameters);

const mapStateToProps = (state: GlobalState, props: RelayProps) => ({
  initialValues: {
    title: props.group.title,
    description: props.group.description,
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  group: graphql`
    fragment GroupAdminParameters_group on Group {
      id
      title
      description
    }
  `,
});
