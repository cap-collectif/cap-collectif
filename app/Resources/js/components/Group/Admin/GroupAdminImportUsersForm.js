// @flow
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, Field, change } from 'redux-form';
import type { DropzoneFile } from 'react-dropzone';
import AddUsersToGroupFromEmailMutation from '../../../mutations/AddUsersToGroupFromEmailMutation';
import type { Dispatch, Uuid } from '../../../types';
import type {
  AddUsersToGroupFromEmailMutationResponse,
  AddUsersToGroupFromEmailMutationVariables,
} from '../../../mutations/__generated__/AddUsersToGroupFromEmailMutation.graphql';
import type { User } from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';
import { CsvDropZoneInput } from './CsvDropZoneInput';

type Props = {
  handleSubmit: () => void,
};

type State = {
  showMoreError: boolean,
  analyzed: boolean,
  files: ?Array<DropzoneFile>,
};

type DefaultProps = void;
type FormValues = {
  emails: string,
};

type ResponseFormValues = {
  importedUsers: Array<User>,
  notFoundEmails: Array<string>,
};

type SubmittedFormValue = {
  emails: ResponseFormValues,
};

export const formName = 'group-users-import';

const prepareVariablesFromAnalyzedFile = (
  fileContent: string,
  groupId: Uuid,
  dryRun: boolean,
): AddUsersToGroupFromEmailMutationVariables => {
  const emails = fileContent
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((email: string) => email.replace(/['"]+/g, ''));

  // detects if first line is a header
  if (emails.length > 0 && !isEmail(emails[0])) {
    emails.shift();
  }

  return {
    input: {
      emails,
      groupId,
      dryRun,
    },
  };
};

const onSubmit = (values: SubmittedFormValue, dispatch: Dispatch, { group, onClose, reset }) => {
  const variables = {
    input: {
      emails: values.emails.importedUsers.map((user: User) => user.email),
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
  const variables = prepareVariablesFromAnalyzedFile(values.emails, group.id, true);

  return AddUsersToGroupFromEmailMutation.commit(variables).then(
    (response: AddUsersToGroupFromEmailMutationResponse) => {
      if (!response || !response.addUsersToGroupFromEmail) {
        reset();
        return;
      }

      const { importedUsers, notFoundEmails } = response.addUsersToGroupFromEmail;
      dispatch(
        change(formName, 'emails', {
          importedUsers,
          notFoundEmails,
        }),
      );
    },
  );
};

export class GroupAdminImportUsersForm extends React.Component<Props, State> {
  static defaultProps: DefaultProps;

  state = {
    showMoreError: false,
    analyzed: false,
    files: null,
  };

  onPostDrop = (droppedFiles: Array<DropzoneFile>, input: Object) => {
    this.setState({ showMoreError: false, analyzed: true, files: droppedFiles });
    droppedFiles.forEach(file => {
      const reader = new window.FileReader();
      reader.onload = () => {
        input.onChange(reader.result);
      };
      reader.onabort = () => input.onChange(null);
      reader.onerror = () => input.onChange(null);
      reader.readAsText(file);
    });
  };

  toggle = () => {
    this.setState((prevState: State) => ({
      showMoreError: !prevState.showMoreError,
    }));
  };

  render() {
    const { handleSubmit } = this.props;
    const { showMoreError, analyzed, files } = this.state;
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
            component={CsvDropZoneInput}
            showMoreError={showMoreError}
            disabled={analyzed}
            onClickShowMoreError={this.toggle}
            currentFile={files && files.length > 0 ? files[0] : null}
            onPostDrop={this.onPostDrop}
          />
        </div>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
  asyncValidate,
  shouldAsyncValidate: ({ trigger }) => {
    switch (trigger) {
      case 'touch':
      case 'blur':
      case 'submit':
        return false;
      case 'change':
        return true;
      default:
        return true;
    }
  },
})(GroupAdminImportUsersForm);

export default injectIntl(form);
