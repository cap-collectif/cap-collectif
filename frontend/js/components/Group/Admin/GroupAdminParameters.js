// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { useIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { useDisclosure } from '@liinkiing/react-hooks';
import { Button } from 'react-bootstrap';
import type { GroupAdminParameters_group } from '~relay/GroupAdminParameters_group.graphql';
import AlertForm from '../../Alert/AlertForm';
import DeleteGroupMutation from '../../../mutations/DeleteGroupMutation';
import SubmitButton from '../../Form/SubmitButton';
import type { Dispatch, GlobalState } from '~/types';
import UpdateGroupMutation from '../../../mutations/UpdateGroupMutation';
import GroupForm from '../GroupForm';
import DeleteModal from '../../Modal/DeleteModal';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Tooltip from '~ds/Tooltip/Tooltip';

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
    window.location.href = `${window.location.protocol}//${window.location.host}/admin/capco/app/group/list`;
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

export const GroupAdminParameters = ({
  submitting,
  submit,
  invalid,
  valid,
  group,
  submitSucceeded,
  submitFailed,
  pristine,
}: Props) => {
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  return (
    <div className="box box-primary container-fluid">
      <div className="box-header  pl-0">
        <h3 className="box-title">{intl.formatMessage({ id: 'global.params' })}</h3>
      </div>
      <div className="box-content">
        <GroupForm />

        <DeleteModal
          closeDeleteModal={onClose}
          showDeleteModal={isOpen}
          deleteElement={() => {
            onDelete(group.id);
          }}
          deleteModalTitle="group.admin.parameters.modal.delete.title"
          deleteModalContent="group.admin.parameters.modal.delete.content"
          buttonConfirmMessage="global.removeDefinitively"
        />

        <ButtonGroup>
          <SubmitButton
            id="confirm-group-edit"
            isSubmitting={submitting}
            disabled={pristine || invalid || submitting}
            label="global.save"
            onSubmit={() => {
              submit(formName);
            }}
          />
          {group.isUsedInEmailing ? (
            <Tooltip
              placement="top"
              label={intl.formatMessage({ id: 'group-used-in-mailinglist' })}
              id="tooltip-top"
              className="text-left"
              style={{ wordBreak: 'break-word' }}>
              <div>
                <Button bsStyle="danger" onClick={onOpen} disabled>
                  <i className="fa fa-trash" /> {intl.formatMessage({ id: 'global.delete' })}
                </Button>
              </div>
            </Tooltip>
          ) : (
            <Button bsStyle="danger" onClick={onOpen}>
              <i className="fa fa-trash" /> {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          )}
          <AlertForm
            valid={valid}
            invalid={invalid}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
        </ButtonGroup>
      </div>
    </div>
  );
};

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

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);

export default createFragmentContainer(container, {
  group: graphql`
    fragment GroupAdminParameters_group on Group {
      id
      title
      description
      isUsedInEmailing
    }
  `,
});
