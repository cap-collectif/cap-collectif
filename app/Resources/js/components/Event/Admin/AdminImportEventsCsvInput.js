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
  'registrationEnable',
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

export const AdminImportEventsCsvInput = ({
  input,
  meta: { asyncValidating, valid },
  onPostDrop,
  disabled,
  currentFile,
}: FileUploadFieldProps) => (
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
        maxSize={26000}
        inputProps={{ id: 'csv-file_field' }}
        minSize={1}
        disabled={disabled}
        onDrop={(files: Array<DropzoneFile>) => {
          onPostDrop(files, input);
        }}
      />
      {!asyncValidating && Array.isArray(input.value) && (
        <React.Fragment>
          <div className="h5">
            <FormattedHTMLMessage id="document-analysis" /> {currentFile ? currentFile.name : ''}
          </div>
          <Row className="mt-15">
            <Col xs={12} sm={12} className="text-center">
              <h4>
                <i className="cap cap-check-bubble text-success" />{' '}
                <b>
                  <FormattedMessage id="count-events-found" values={{ num: input.value.length }} />
                </b>
              </h4>
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
