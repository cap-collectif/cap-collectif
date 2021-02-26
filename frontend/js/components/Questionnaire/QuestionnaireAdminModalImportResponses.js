// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Modal } from 'react-bootstrap';
import { Field, isPristine, isSubmitting } from 'redux-form';
import type { DropzoneFile } from 'react-dropzone';
import CloseButton from '../Form/CloseButton';
import type { Dispatch, GlobalState } from '~/types';
import { QuestionnaireResponsesCsvDropZoneInput } from './QuestionnaireResponsesCsvDropZoneInput';

type Props = {|
  show: boolean,
  onAdd: () => void,
  onClose: () => void,
  formName: string,
  dispatch: Dispatch,
  intl: IntlShape,
  submitting: boolean,
  pristine: boolean,
  type: string,
  oldMember: string,
  asyncValidating: ?string,
|};

type DefaultProps = void;

type State = {|
  analyzed: boolean,
  files: ?Array<DropzoneFile>,
|};

export class QuestionnaireAdminModalImportResponses extends React.Component<Props, State> {
  static defaultProps: DefaultProps;

  state = {
    analyzed: false,
    files: null,
  };

  onPostDrop = (
    droppedFiles: Array<DropzoneFile>,
    input: Object,
    oldMember: string,
    type: string,
  ) => {
    this.setState({ analyzed: true, files: droppedFiles });
    droppedFiles.forEach(file => {
      const reader = new window.FileReader();
      reader.onload = () => {
        input.onChange({ data: reader.result, oldMember, type, fileType: file.type });
      };
      reader.onabort = () => input.onChange(null);
      reader.onerror = () => input.onChange(null);
      reader.readAsText(file);
    });
  };

  render() {
    const { show, onClose, type, oldMember, intl, submitting, pristine, onAdd } = this.props;
    const { analyzed, files } = this.state;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="delete-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="import-responses" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Field
              name={`${oldMember}.importedResponses`}
              label={<FormattedMessage id="csv-file" />}
              id="csv-file"
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              component={QuestionnaireResponsesCsvDropZoneInput}
              oldMember={oldMember}
              type={type}
              disabled={analyzed}
              currentFile={files && files.length > 0 ? files[0] : null}
              onPostDrop={this.onPostDrop}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton label={intl.formatMessage({ id: 'global.cancel' })} onClose={onClose} />
          <Button
            disabled={pristine || submitting}
            bsStyle="primary"
            type="button"
            id="import-file"
            onClick={onAdd}>
            <FormattedMessage id="import" />
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  return {
    submitting: isSubmitting(props.formName)(state),
    pristine: isPristine(props.formName)(state),
  };
};

export default connect<any, any, _, _, _, _>(mapStateToProps)(
  injectIntl(QuestionnaireAdminModalImportResponses),
);
