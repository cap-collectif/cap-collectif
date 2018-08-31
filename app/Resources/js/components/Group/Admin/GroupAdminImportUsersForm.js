// @flow
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { FormGroup, HelpBlock, ControlLabel, Row, Col, Collapse } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import type { FieldProps } from 'redux-form';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import FileUpload from '../../Form/FileUpload';
import AddUsersToGroupFromEmailMutation from '../../../mutations/AddUsersToGroupFromEmailMutation';
import type { Dispatch, Uuid } from '../../../types';
import config from '../../../config';
import type {
  AddUsersToGroupFromEmailMutationResponse,
  AddUsersToGroupFromEmailMutationVariables,
} from '../../../mutations/__generated__/AddUsersToGroupFromEmailMutation.graphql';
import Loader from '../../Ui/Loader';

type Props = {
  group: GroupAdminUsers_group,
  handleSubmit: Function,
  dispatch: Dispatch,
  onClose: Function,
};

type State = {
  showMoreError: boolean,
  analyzed: boolean,
};

type DefaultProps = void;
type FormValues = {
  emails: string,
};

type FileUploadFieldProps = FieldProps & {
  showMoreError: boolean,
  onClickShowMoreError: Function,
  onResetField: Function,
  hide: boolean,
};

export const formName = 'group-users-import';

const prepareVariables = (
  fileContent: string,
  groupId: Uuid,
  dryRun: boolean,
): AddUsersToGroupFromEmailMutationVariables => {
  const emails = fileContent.split('\n').map((email: string) => {
    return email.replace(/['"]+/g, '');
  });

  return {
    input: {
      emails,
      groupId,
      dryRun,
    },
  };
};

const onSubmit = (values: FormValues, dispatch: Dispatch, { group, onClose, reset }) => {
  const variables = prepareVariables(values.emails, group.id, false);

  return AddUsersToGroupFromEmailMutation.commit(variables).then(() => {
    reset();
    onClose();
  });
};

const asyncValidate = (values: FormValues, dispatch: Dispatch, { group, reset }) => {
  const variables = prepareVariables(values.emails, group.id, true);

  return AddUsersToGroupFromEmailMutation.commit(variables).then(
    (response: AddUsersToGroupFromEmailMutationResponse) => {
      if (!response || !response.addUsersToGroupFromEmail) {
        reset();
      }

      const data = response.addUsersToGroupFromEmail;

      // eslint-disable-next-line no-throw-literal
      throw {
        emails: {
          importedUsers: data ? data.importedUsers : [],
          notFoundEmails: data ? data.notFoundEmails : [],
        },
      };
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

const renderDropzoneInput = ({
  input,
  meta: { asyncValidating, error },
  showMoreError,
  onClickShowMoreError,
  onResetField,
  hide,
}: FileUploadFieldProps) => {
  const colWidth = error && error.notFoundEmails.length === 0 ? 12 : 6;

  return (
    <FormGroup>
      <ControlLabel htmlFor={input.name}>
        <FormattedMessage id="csv-file" />
      </ControlLabel>
      <HelpBlock>
        <FormattedHTMLMessage id="csv-file-helptext" />
      </HelpBlock>
      <Loader show={asyncValidating}>
        {!hide && (
          <FileUpload
            id="csv-file"
            name={input.name}
            accept="text/csv"
            maxSize={26000}
            minSize={1}
            onDrop={(files: Array<File>) => {
              onDrop(files, input);
              onResetField();
            }}
          />
        )}
        {!asyncValidating &&
          error &&
          hide && (
            <React.Fragment>
              <div className="h5">
                <FormattedMessage id="document-analysis" />{' '}
              </div>
              <Row className="mt-15">
                <Col xs={12} sm={colWidth} className="text-center pl-0 pr-0">
                  <h4>
                    <i className="cap cap-check-bubble text-success" />{' '}
                    <b>
                      <FormattedMessage
                        id="count-users-found"
                        values={{ num: error.importedUsers.length }}
                      />
                    </b>
                  </h4>
                </Col>
                {error.notFoundEmails &&
                  error.notFoundEmails.length > 0 && (
                    <Col xs={12} sm={colWidth} className="text-center pl-0 pr-0 ">
                      <h4>
                        <i className="cap cap-ios-close text-danger" />{' '}
                        <b>
                          <FormattedMessage
                            id="count-untraceable-users"
                            values={{ num: error.notFoundEmails.length }}
                          />
                        </b>
                      </h4>
                      <Collapse in={showMoreError}>
                        <ul
                          style={{ listStyle: 'none', maxHeight: 80, overflowY: 'scroll' }}
                          className="small">
                          {error.notFoundEmails.map((email: string) => {
                            return <li>{email}</li>;
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
  };

  toggle() {
    this.setState((prevState: State) => ({
      showMoreError: !prevState.showMoreError,
    }));
  }

  render() {
    const { handleSubmit } = this.props;
    const { showMoreError, analyzed } = this.state;
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
            hide={analyzed}
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            component={renderDropzoneInput}
            showMoreError={showMoreError}
            onClickShowMoreError={this.toggle.bind(this)}
            onResetField={() => {
              this.setState({ showMoreError: false, analyzed: true });
            }}
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
})(GroupAdminImportUsersForm);

export default injectIntl(form);
