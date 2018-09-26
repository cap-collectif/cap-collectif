// @flow
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { FormGroup, HelpBlock, ControlLabel, Row, Col, Collapse } from 'react-bootstrap';
import { reduxForm, Field, change } from 'redux-form';
import type { FieldProps } from 'redux-form';
import type { DropzoneFile } from 'react-dropzone';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import FileUpload from '../../Form/FileUpload';
import AddUsersToGroupFromEmailMutation from '../../../mutations/AddUsersToGroupFromEmailMutation';
import type { Dispatch, Uuid } from '../../../types';
import type {
  AddUsersToGroupFromEmailMutationResponse,
  AddUsersToGroupFromEmailMutationVariables,
} from '../../../mutations/__generated__/AddUsersToGroupFromEmailMutation.graphql';
import Loader from '../../Ui/Loader';
import type { User } from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';

type Props = {
  group: GroupAdminUsers_group,
  handleSubmit: () => void,
  dispatch: Dispatch,
  onClose: () => void,
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

type FileUploadFieldProps = FieldProps & {
  showMoreError: boolean,
  onClickShowMoreError: () => void,
  onPostDrop: (droppedFiles: Array<DropzoneFile>, input: Object) => void,
  disabled: boolean,
  currentFile: ?DropzoneFile,
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
    .map((email: string) => {
      return email.replace(/['"]+/g, '');
    });

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
      emails: values.emails.importedUsers.map((user: User) => {
        return user.email;
      }),
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

const renderDropzoneInput = ({
  input,
  meta: { asyncValidating },
  showMoreError,
  onClickShowMoreError,
  onPostDrop,
  disabled,
  currentFile,
}: FileUploadFieldProps) => {
  const colWidth = input.value.notFoundEmails && input.value.notFoundEmails.length === 0 ? 12 : 6;

  return (
    <FormGroup>
      <ControlLabel htmlFor={input.name}>
        <FormattedMessage id="csv-file" />
      </ControlLabel>
      <HelpBlock>
        <FormattedHTMLMessage
          id="csv-file-helptext"
          values={{
            link: encodeURI('data:text/csv;charset=utf-8,Email Address [Required]'),
          }}
        />
      </HelpBlock>
      <Loader show={asyncValidating}>
        <FileUpload
          name={input.name}
          accept="text/csv"
          maxSize={26000}
          inputProps={{ id: 'csv-file_field' }}
          minSize={1}
          disabled={disabled}
          onDrop={(files: Array<DropzoneFile>) => {
            onPostDrop(files, input);
          }}
        />
        {!asyncValidating &&
          input.value.importedUsers && (
            <React.Fragment>
              <div className="h5">
                <FormattedHTMLMessage id="document-analysis" />{' '}
                {currentFile ? currentFile.name : ''}
              </div>
              <Row className="mt-15">
                <Col xs={12} sm={colWidth} className="text-center">
                  <h4>
                    <i className="cap cap-check-bubble text-success" />{' '}
                    <b>
                      <FormattedMessage
                        id="count-users-found"
                        values={{ num: input.value.importedUsers.length }}
                      />
                    </b>
                  </h4>
                </Col>
                {input.value.notFoundEmails &&
                  input.value.notFoundEmails.length > 0 && (
                    <Col xs={12} sm={colWidth} className="text-center">
                      <h4>
                        <i className="cap cap-ios-close text-danger" />{' '}
                        <b>
                          <FormattedMessage
                            id="count-untraceable-users"
                            values={{ num: input.value.notFoundEmails.length }}
                          />
                        </b>
                      </h4>
                      <Collapse in={showMoreError}>
                        <ul
                          style={{ listStyle: 'none', maxHeight: 80, overflowY: 'scroll' }}
                          className="small">
                          {input.value.notFoundEmails.map((email: string, key: number) => {
                            return <li key={key}>{email}</li>;
                          })}
                        </ul>
                      </Collapse>
                      <div
                        className="text-info"
                        style={{ cursor: 'pointer' }}
                        onClick={onClickShowMoreError}>
                        <i className={showMoreError ? 'cap cap-arrow-40' : 'cap cap-arrow-39'} />{' '}
                        <FormattedMessage id={showMoreError ? 'see-less' : 'global.see'} />
                      </div>
                    </Col>
                  )}
              </Row>
            </React.Fragment>
          )}
      </Loader>
    </FormGroup>
  );
};

export class GroupAdminImportUsersForm extends React.Component<Props, State> {
  static defaultProps: DefaultProps;
  state = {
    showMoreError: false,
    analyzed: false,
    files: null,
  };

  onPostDrop(droppedFiles: Array<DropzoneFile>, input: Object) {
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
  }

  toggle() {
    this.setState((prevState: State) => ({
      showMoreError: !prevState.showMoreError,
    }));
  }

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
            component={renderDropzoneInput}
            showMoreError={showMoreError}
            disabled={analyzed}
            onClickShowMoreError={() => {
              this.toggle();
            }}
            currentFile={files && files.length > 0 ? files[0] : null}
            onPostDrop={this.onPostDrop.bind(this)}
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
