// @flow
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { FormGroup, HelpBlock, ControlLabel } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import type { FieldProps } from 'redux-form';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import FileUpload from '../../Form/FileUpload';
import AddUsersToGroupFromEmailMutation from '../../../mutations/AddUsersToGroupFromEmailMutation';
import type { Dispatch } from '../../../types';
import config from '../../../config';
import type { AddUsersToGroupFromEmailMutationResponse } from '../../../mutations/__generated__/AddUsersToGroupFromEmailMutation.graphql';
import Loader from '../../Ui/Loader';

type Props = {
  group: GroupAdminUsers_group,
  handleSubmit: Function,
  dispatch: Dispatch,
  onClose: Function,
};

type DefaultProps = void;
type FormValues = {
  emails: string,
};

export const formName = 'group-users-import';

const onSubmit = (values: FormValues, dispatch: Dispatch, { group, onClose, reset }) => {
  const emails = values.emails.split('\n').map((email: string) => {
    return email.replace(/['"]+/g, '');
  });

  const variables = {
    input: {
      emails,
      groupId: group.id,
      dryRun: false,
    },
  };

  return AddUsersToGroupFromEmailMutation.commit(variables).then(() => {
    reset();
    onClose();
  });
};

const asyncValidate = (values: FormValues, dispatch: Dispatch, { group, reset }) => {
  console.log(values);
  const emails = values.emails.split('\n').map((email: string) => {
    return email.replace(/['"]+/g, '');
  });

  const variables = {
    input: {
      emails,
      groupId: group.id,
      dryRun: true,
    },
  };

  return AddUsersToGroupFromEmailMutation.commit(variables).then(
    (response: AddUsersToGroupFromEmailMutationResponse) => {
      reset();
      console.log(response);
      // @TODO: here change the state of 2 cols
    },
  );
};

const onDrop = (acceptedFiles: Array<File>, { onChange }) => {
  if (!config.canUseDOM) {
    return;
  }

  acceptedFiles.forEach(file => {
    const reader = new window.FileReader();
    reader.onload = () => {
      onChange(reader.result);
    };
    reader.onabort = () => onChange(null);
    reader.onerror = () => onChange(null);

    reader.readAsText(file);
  });
};

const renderDropzoneInput = ({ input, meta: { asyncValidating } }: FieldProps) => {
  return (
    <FormGroup>
      <ControlLabel htmlFor={input.name}>
        <FormattedMessage id="csv-file" />
      </ControlLabel>
      <HelpBlock>
        <FormattedHTMLMessage id="csv-file-helptext" />
      </HelpBlock>
      <Loader show={asyncValidating}>
        <FileUpload
          id="csv-file"
          name={input.name}
          accept="text/csv"
          maxSize={26000}
          minSize={1}
          onDrop={(files: Array<File>) => {
            onDrop(files, input);
          }}
        />
      </Loader>
    </FormGroup>
  );
};

export class GroupAdminImportUsersForm extends React.Component<Props> {
  static defaultProps: DefaultProps;

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <p>
            <FormattedMessage id="import-users-helptext" />
          </p>
          <Field
            name="emails"
            label={<FormattedMessage id="group.admin.form.users" />}
            id="csv-file"
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            component={renderDropzoneInput}
          />
        </div>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
  destroyOnUnmount: false,
  asyncValidate,
})(GroupAdminImportUsersForm);

export default injectIntl(form);
