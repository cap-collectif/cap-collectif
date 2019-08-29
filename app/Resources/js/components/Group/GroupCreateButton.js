// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import CreateGroupMutation from '../../mutations/CreateGroupMutation';
import type { CreateGroupMutationResponse } from '~relay/CreateGroupMutation.graphql';
import GroupForm from './GroupForm';

export type Props = {|
  submit: Function,
  submitting: boolean,
|};

type ComponentState = {
  showModal: boolean,
};

type FormValues = Object;

const formName = 'group-create';

const validate = ({ title }) => {
  const errors = {};
  if (!title || title.length === 0) {
    errors.title = 'global.constraints.notBlank';
  }

  return errors;
};

const onSubmit = (values: FormValues) =>
  CreateGroupMutation.commit({ input: values }).then((resp: CreateGroupMutationResponse) => {
    if (resp.createGroup) {
      const groupId = resp.createGroup.group.id;
      window.location.href = `${window.location.protocol}//${window.location.host}/admin/capco/app/group/${groupId}/edit`;
    }
  });

export class GroupCreateButton extends React.Component<Props, ComponentState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: false,
    };
  }

  render() {
    const { submitting, submit } = this.props;
    const { showModal } = this.state;

    return (
      <div>
        <Button
          id="add-group"
          bsStyle="default"
          style={{ marginTop: 10 }}
          onClick={() => {
            this.setState({ showModal: true });
          }}>
          <FormattedMessage id="group.create.button" />
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="group.create.title" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <GroupForm />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
            <SubmitButton
              id="confirm-group-create"
              label="global.add"
              isSubmitting={submitting}
              onSubmit={() => {
                submit(formName);
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default reduxForm({
  onSubmit,
  validate,
  form: formName,
})(GroupCreateButton);
