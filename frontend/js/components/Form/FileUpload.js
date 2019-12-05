// @flow
import * as React from 'react';
import { type DropzoneProps, useDropzone } from 'react-dropzone';
import classNames from 'classnames';
import { Button, Col, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

export const FileUpload = (props: DropzoneProps) => {
  const { inputProps, onDrop, ...rest } = props;
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const classes = {
    'image-uploader': true,
  };

  return (
    <Row className={classNames(classes)}>
      <Col xs={12} sm={12}>
        <div {...getRootProps()} className="image-uploader__dropzone--fullwidth">
          <div className="image-uploader__dropzone-label">
            <FormattedMessage id="global.image_uploader.file.dropzone" />
            <br />
            <FormattedMessage id="global.or" />
            <p style={{ textAlign: 'center' }}>
              <Button className="image-uploader__btn">
                <input {...getInputProps({ ...rest, id: inputProps?.id })} />
                <FormattedMessage id="global.image_uploader.file.btn" />
              </Button>
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default FileUpload;
