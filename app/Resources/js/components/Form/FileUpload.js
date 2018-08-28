// @flow
import * as React from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { Button, Col, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Props = {
  id: string,
  name: string,
  accept: string,
  maxSize: number,
  minSize: number,
  onDrop: Function,
};

export class FileUpload extends React.Component<Props> {
  render() {
    const { id, name, accept, minSize, maxSize, onDrop } = this.props;

    const classes = {
      'image-uploader': true,
    };

    return (
      <Row id={id} className={classNames(classes)}>
        <Col xs={12} sm={12}>
          <Dropzone
            ref="dropzone"
            onDrop={onDrop}
            accept={accept}
            minSize={minSize}
            maxSize={maxSize}
            name={name}
            inputProps={{ id: `${id}_field` }}
            disablePreview
            className="image-uploader__dropzone--fullwidth">
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
