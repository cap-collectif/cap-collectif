// @flow
import React from 'react';
import type { DropzoneFile } from 'react-dropzone';
import type { FieldProps } from 'redux-form';
import { Col, ControlLabel, FormGroup, HelpBlock, Row } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import FileUpload from '../Form/FileUpload';
import InfoMessage from '~ds/InfoMessage/InfoMessage';

type FileUploadFieldProps = {
  input: {
    value: $PropertyType<$PropertyType<FieldProps, 'input'>, 'value'>,
    name: $PropertyType<$PropertyType<FieldProps, 'input'>, 'name'>,
  },
  meta: {
    asyncValidating: $PropertyType<$PropertyType<FieldProps, 'meta'>, 'asyncValidating'>,
  },
  onPostDrop: (droppedFiles: Array<DropzoneFile>, input: Object) => void,
  disabled: boolean,
  currentFile: ?DropzoneFile,
};

const CSV_MAX_UPLOAD_SIZE = 80000;

export const CsvDropZoneInput = ({
  input,
  meta: { asyncValidating },
  onPostDrop,
  disabled,
  currentFile,
}: FileUploadFieldProps) => {
  const intl = useIntl();

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
          maxSize={CSV_MAX_UPLOAD_SIZE}
          inputProps={{ id: 'csv-file_field' }}
          minSize={1}
          disabled={disabled}
          onDrop={(files: Array<DropzoneFile>) => {
            onPostDrop(files, input);
          }}
        />
        {!asyncValidating && input.value.importedUsers && input.value.importedUsers.length > 0 && (
          <React.Fragment>
            <div className="h5">
              <FormattedHTMLMessage id="document-analysis" /> {currentFile ? currentFile.name : ''}
            </div>
            <Row className="mt-15">
              <Col className="p-5" xs={12}>
                <InfoMessage variant="success">
                  <InfoMessage.Title withIcon>
                    {intl.formatMessage(
                      { id: 'count-users-found' },
                      {
                        num: input.value.importedUsers.length,
                      },
                    )}
                  </InfoMessage.Title>
                </InfoMessage>
              </Col>
              {input.value.invalidLines && input.value.invalidLines.length > 0 && (
                <Col className="p-5" xs={12}>
                  <InfoMessage variant="danger">
                    <InfoMessage.Title withIcon>
                      <FormattedHTMLMessage
                        id="csv-bad-lines-error"
                        values={{
                          count: [...input.value.invalidLines].length?.toString(),
                          lines:
                            input.value.invalidLines.length > 1
                              ? input.value.invalidLines.slice(0, -1).toString()
                              : input.value.invalidLines.toString(),
                          last: [...input.value.invalidLines]?.pop()?.toString(),
                        }}
                      />
                    </InfoMessage.Title>
                  </InfoMessage>
                </Col>
              )}
              {input.value.duplicateLines && input.value.duplicateLines.length > 0 && (
                <Col className="p-5" xs={12}>
                  <InfoMessage variant="warning">
                    <InfoMessage.Title withIcon>
                      {intl.formatMessage(
                        { id: 'row-import-duplicates-error' },
                        {
                          num: input.value.duplicateLines.length,
                          lines:
                            input.value.duplicateLines.length > 1
                              ? input.value.duplicateLines.slice(0, -1).toString()
                              : input.value.duplicateLines.toString(),
                          last: input.value.duplicateLines.pop(),
                        },
                      )}
                    </InfoMessage.Title>
                  </InfoMessage>
                </Col>
              )}
            </Row>
          </React.Fragment>
        )}
      </Loader>
    </FormGroup>
  );
};
