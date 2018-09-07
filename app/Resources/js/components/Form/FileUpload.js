// @flow
import * as React from 'react';
import Dropzone from 'react-dropzone';
import type { DropzoneProps } from 'react-dropzone';
import classNames from 'classnames';
import { Button, Col, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

export class FileUpload extends React.Component<DropzoneProps> {
  render() {
    const classes = {
      'image-uploader': true,
    };

    return (
      <Row className={classNames(classes)}>
        <Col xs={12} sm={12}>
          <Dropzone className="image-uploader__dropzone--fullwidth" {...this.props}>
            <div className="image-uploader__dropzone-label">
              <FormattedMessage id="global.image_uploader.file.dropzone" />
              <br />
              <FormattedMessage id="global.or" />
              <p style={{ textAlign: 'center' }}>
                <Button className="image-uploader__btn">
                  <FormattedMessage id="global.image_uploader.file.btn" />
                </Button>
              </p>
            </div>
          </Dropzone>
        </Col>
      </Row>
    );
  }
}

export default FileUpload;
