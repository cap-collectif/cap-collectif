// @flow
import React from 'react';
import type { DropzoneFile } from 'react-dropzone';
import type { FieldProps } from 'redux-form';
import { Col, ControlLabel, FormGroup, HelpBlock, Row } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import FileUpload from '../../Form/FileUpload';

type FileUploadFieldProps = FieldProps & {
  onPostDrop: (droppedFiles: Array<DropzoneFile>, input: Object) => void,
  disabled: boolean,
  currentFile: ?DropzoneFile,
};

export const HEADERS = [
  'title',
  'body',
  'authorEmail',
  'startAt',
  'endAt',
  'guestListEnabled',
  'address',
  'zipCode',
  'city',
  'country',
  'themes',
  'projects',
  'enabled',
  'commentable',
  'metaDescription',
  'customCode',
  'link',
];

const CSV_MAX_UPLOAD_SIZE = 8000000; // 8 Mo
export const AdminImportEventsCsvInput = ({
  input,
  meta: { asyncValidating, valid },
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
            link: encodeURI(`data:text/csv;charset=utf-8,${HEADERS.join(';')}`),
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
        {!asyncValidating && Array.isArray(input.value.importedEvents) && (
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
                      id="count-events-found"
                      values={{ num: input.value.importedEvents.length }}
                    />
                  </b>
                </h4>
              </Col>
              <Col xs={12} sm={colWidth} className="text-center">
                {input.value.notFoundEmails && input.value.notFoundEmails.length > 0 && (
                  <div>
                    <h4>
                      <i className="cap cap-ios-close text-danger" />{' '}
                      <b>
                        <FormattedMessage
                          id="count-untraceable-users"
                          values={{ num: input.value.notFoundEmails.length }}
                        />
                      </b>
                    </h4>
                    <ul
                      style={{ listStyle: 'none', maxHeight: 80, overflowY: 'scroll' }}
                      className="small">
                      {input.value.notFoundEmails.map((email: string, key: number) => (
                        <li key={key}>{email}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {input.value.notFoundThemes && input.value.notFoundThemes.length > 0 && (
                  <div>
                    <h4>
                      <i className="cap cap-ios-close text-danger" />{' '}
                      <b>
                        <FormattedMessage
                          id="count-untraceable-themes"
                          values={{ num: input.value.notFoundThemes.length }}
                        />
                      </b>
                    </h4>
                    <ul
                      style={{ listStyle: 'none', maxHeight: 80, overflowY: 'scroll' }}
                      className="small">
                      {input.value.notFoundThemes.map((themes: string, key: number) => (
                        <li key={key}>{themes}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {input.value.brokenDates && input.value.brokenDates.length > 0 && (
                  <div>
                    <h4>
                      <i className="cap cap-ios-close text-danger" />{' '}
                      <b>
                        <FormattedMessage
                          id="count-untraceable-dates"
                          values={{ num: input.value.brokenDates.length }}
                        />
                      </b>
                    </h4>
                    <ul
                      style={{ listStyle: 'none', maxHeight: 80, overflowY: 'scroll' }}
                      className="small">
                      {input.value.brokenDates.map((dates: string, key: number) => (
                        <li key={key}>{dates}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Col>
            </Row>
          </React.Fragment>
        )}
        {!valid && (
          <h4>
            <i className="cap cap-ios-close text-danger" />{' '}
            <b>
              <FormattedMessage id="could_not_read-file" />
            </b>
          </h4>
        )}
      </Loader>
    </FormGroup>
  );
};
