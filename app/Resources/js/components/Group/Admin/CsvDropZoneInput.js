// @flow
import React from 'react';
import type { DropzoneFile } from 'react-dropzone';
import type { FieldProps } from 'redux-form';
import { Col, Collapse, ControlLabel, FormGroup, HelpBlock, Row } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import FileUpload from '../../Form/FileUpload';

type FileUploadFieldProps = FieldProps & {
  showMoreError: boolean,
  onClickShowMoreError: (event: SyntheticEvent<HTMLButtonElement>) => void,
  onPostDrop: (droppedFiles: Array<DropzoneFile>, input: Object) => void,
  disabled: boolean,
  currentFile: ?DropzoneFile,
};

export const CsvDropZoneInput = ({
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
        {!asyncValidating && input.value.importedUsers && (
          <React.Fragment>
            <div className="h5">
              <FormattedHTMLMessage id="document-analysis" /> {currentFile ? currentFile.name : ''}
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
              {input.value.notFoundEmails && input.value.notFoundEmails.length > 0 && (
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
                      {input.value.notFoundEmails.map((email: string, key: number) => (
                        <li key={key}>{email}</li>
                      ))}
                    </ul>
                  </Collapse>
                  <div
                    className="text-info"
                    style={{ cursor: 'pointer' }}
                    onClick={onClickShowMoreError}
                    onKeyPress={onClickShowMoreError}
                    role="button"
                    tabIndex={0}>
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
