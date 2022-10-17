// @flow
import React from 'react';
import type { DropzoneFile } from 'react-dropzone';
import type { FieldProps } from 'redux-form';
import { Col, ControlLabel, FormGroup, HelpBlock, Row } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import FileUpload from '../Form/FileUpload';
import Tooltip from '~ds/Tooltip/Tooltip';
import Flex from '~ui/Primitives/Layout/Flex';

type FileUploadFieldProps = {
  ...FieldProps,
  showMoreError: boolean,
  onClickShowMoreError: (event: SyntheticEvent<HTMLButtonElement>) => void,
  onPostDrop: (
    droppedFiles: Array<DropzoneFile>,
    input: Object,
    oldMember: string,
    type: string,
  ) => void,
  disabled: boolean,
  currentFile: ?DropzoneFile,
  type: string,
  oldMember: string,
};

const CSV_MAX_UPLOAD_SIZE = 80000;

export const QuestionnaireResponsesCsvDropZoneInput = ({
  input,
  meta: { asyncValidating },
  currentFile,
  type,
  onPostDrop,
  oldMember,
}: FileUploadFieldProps) => {
  const colWidth = 12;

  return (
    <FormGroup>
      <ControlLabel htmlFor={input.name}>
        <FormattedMessage id="csv-file" />
      </ControlLabel>
      <HelpBlock>
        <FormattedHTMLMessage
          id="reply-csv-file-helptext"
          values={{
            url: encodeURI(
              'data:text/csv;charset=utf-8, Couleur \n bleu \n blanc \n rouge \n vert',
            ),
          }}
        />
      </HelpBlock>
      <Loader show={asyncValidating}>
        <FileUpload
          name={input.name}
          accept="text/csv"
          multiple={false}
          maxSize={CSV_MAX_UPLOAD_SIZE}
          inputProps={{ id: 'csv-file_field' }}
          minSize={1}
          onDrop={(files: Array<DropzoneFile>) => {
            onPostDrop(files, input, oldMember, type);
          }}
        />
        {!asyncValidating && input.value && (
          <React.Fragment>
            <div className="h5">
              <FormattedHTMLMessage id="document-analysis" /> {currentFile ? currentFile.name : ''}
            </div>
            {input.value.error && (
              <Row className="mt-15">
                <Col xs={12} sm={colWidth}>
                  <div className="d-ib">
                    <div className="alert__form_server-failed-message no-padding no-margin">
                      <i className="cap cap-ios-close-outline" />{' '}
                      <FormattedHTMLMessage
                        id="download-error-file-format"
                        values={{ fileName: currentFile ? currentFile.name : '' }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            )}
            {input.value.data && (
              <Row className="mt-15">
                <Col xs={12} sm={colWidth}>
                  <h4>
                    <i className="cap cap-check-bubble text-success" />{' '}
                    <b>
                      <FormattedMessage
                        id="n-items-found"
                        values={{ num: input.value.data.length }}
                      />
                    </b>
                  </h4>
                </Col>
                {input.value.doublons && input.value.doublons.length > 0 && (
                  <Col xs={12} sm={colWidth} className="left">
                    <Flex as="h4">
                      <i className="cap cap-ios-close text-danger" />{' '}
                      <b>
                        <FormattedMessage
                          id="n-duplicate-answer-excluded"
                          values={{ num: input.value.doublons.length }}
                        />
                      </b>
                      <Tooltip
                        key="top"
                        placement="top"
                        label={<FormattedMessage id="help-text-duplicated-answers" />}
                        id="tooltip-top"
                        className="text-left"
                        style={{ wordBreak: 'break-word' }}>
                        <div>
                          <i className="ml-5 cap cap-information" />
                        </div>
                      </Tooltip>
                    </Flex>
                    <ul>
                      {input.value.doublons.map(doublon => (
                        <li>{doublon}</li>
                      ))}
                    </ul>
                  </Col>
                )}
              </Row>
            )}
          </React.Fragment>
        )}
      </Loader>
    </FormGroup>
  );
};
