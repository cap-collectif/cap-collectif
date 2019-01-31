// @flow
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, Field, change, type FormProps } from 'redux-form';
import type { DropzoneFile } from 'react-dropzone';
import Papa from 'papaparse';
import AddEventsMutation from '../../../mutations/AddEventsMutation';
import type { Dispatch } from '../../../types';
import type {
  AddEventsMutationResponse,
  AddEventsMutationVariables,
} from '../../../mutations/__generated__/AddEventsMutation.graphql';
import { AdminImportEventsCsvInput, HEADERS } from './AdminImportEventsCsvInput';

type Props = FormProps & {|
  handleSubmit: () => void,
  onClose: () => void,
|};

type State = {|
  analyzed: boolean,
  files: ?Array<DropzoneFile>,
|};

type SubmittedFormValue = {|
  events: Array<Object>,
|};

export const formName = 'AdminImportEventsForm';

const headersAreValid = (headers: Array<string>): boolean =>
  JSON.stringify(headers) === JSON.stringify(HEADERS);

const prepareVariablesFromAnalyzedFile = (
  csvString: string,
  dryRun: boolean,
): ?AddEventsMutationVariables => {
  const result = Papa.parse(csvString, { header: true });
  if (!headersAreValid(result.meta.fields)) {
    console.warn('File headers are not valid.');
    return null;
  }
  const events = result.data
    .filter(data => data.title !== '')
    .map(data => {
      data.registrationEnable = data.registrationEnable === 'true';
      data.enabled = data.enabled === 'true';
      data.commentable = data.commentable === 'true';
      data.themes = data.themes.split(',')[0] === '' ? [] : data.themes.split(',');
      data.projects = data.projects.split(',')[0] === '' ? [] : data.projects.split(',');
      return data;
    });

  return {
    input: {
      events,
      dryRun,
    },
  };
};

const onSubmit = (values: SubmittedFormValue, dispatch: Dispatch, { onClose, reset }: Props) => {
  const variables = {
    input: {
      events: values.events,
      dryRun: false,
    },
  };

  return AddEventsMutation.commit(variables).then(() => {
    reset();
    onClose();
  });
};

const asyncValidate = (
  values: { events: string },
  dispatch: Dispatch,
  { reset }: Props,
): Promise<*> => {
  const variables = prepareVariablesFromAnalyzedFile(values.events, true);
  if (!variables) {
    return Promise.reject({ events: 'Failed to read events from uploaded file.' });
  }

  return AddEventsMutation.commit(variables).then((response: AddEventsMutationResponse) => {
    if (!response || !response.addEvents) {
      reset();
      return;
    }
    if (response.addEvents.importedEvents.length) {
      dispatch(change(formName, 'events', variables.input.events));
    }
  });
};

export class AdminImportEventsForm extends React.Component<Props, State> {
  state = {
    analyzed: false,
    files: null,
  };

  onPostDrop = (droppedFiles: Array<DropzoneFile>, input: Object) => {
    this.setState({ analyzed: true, files: droppedFiles });
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

  render() {
    const { handleSubmit } = this.props;
    const { analyzed, files } = this.state;
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <Field
            name="events"
            label={<FormattedMessage id="group.admin.form.users" />}
            id="AdminImportEventsForm-csv-file"
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            component={AdminImportEventsCsvInput}
            disabled={analyzed}
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
  shouldAsyncValidate: ({ trigger }: { trigger: string }) => {
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
})(AdminImportEventsForm);

export default injectIntl(form);
