// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { Row, Col, Button } from 'react-bootstrap';
import Input from './Input';
import PreviewMedia from './PreviewMedia';
import Fetcher, { json } from '../../services/Fetcher';

type Props = {
  value: Object | Array<Object>,
  onChange: Function,
  id: string,
  className: string,
  multiple: boolean,
  accept: string,
  maxSize: number,
  minSize: number,
  disablePreview: boolean,
};

export class ImageUpload extends React.Component<Props> {
  static defaultProps = {
    id: '',
    className: '',
    multiple: false,
    maxSize: Infinity,
    minSize: 0,
    disablePreview: false,
  };

  onDrop = (acceptedFiles: Array<File>) => {
    const { onChange, multiple, value } = this.props;
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      Fetcher.postFormData('/files', formData)
        .then(json)
        .then(res => {
          const newFile = {
            id: res.id,
            name: res.name,
            url: res.url,
          };
          this.uncheckDelete();
          const newValue = multiple ? [...value, newFile] : newFile;
          onChange(newValue);
        });
    }
  };

  onToggleDelete = () => {
    const { onChange, multiple } = this.props;
    // $FlowFixMe
    const deleteValue = !this._deleteCheckbox.getWrappedInstance().getValue();
    if (deleteValue) {
      onChange(multiple ? [] : null);
    }
  };

  _deleteCheckbox: ?React.Component<*> | mixed;

  uncheckDelete = () => {
    // $FlowFixMe
    const ref = this._deleteCheckbox;
    if (ref) {
      // $FlowFixMe
      $(ref.getDOMNode()).prop('checked', false);
    }
  };

  removeMedia = (media: Object) => {
    const { multiple, value } = this.props;
    const newValue = multiple ? value.filter(m => m.id !== media.id) : null;
    this.props.onChange(newValue);
  };

  render() {
    const { className, id, multiple, accept, maxSize, minSize, disablePreview, value } = this.props;
    const classes = {
      'image-uploader': true,
    };
    if (className) {
      classes[className] = true;
    }

    const dropzoneTextForFile = (
      <div>
        <FormattedMessage id="global.image_uploader.file.dropzone" />
        <br />
        <FormattedMessage id="global.or" />
      </div>
    );

    const dropzoneTextForImage = (
      <div>
        <FormattedMessage id="global.image_uploader.image.dropzone" />
        <br />
        <FormattedMessage id="global.or" />
      </div>
    );

    return (
      <Row id={id} className={classNames(classes)}>
        {disablePreview && (
          <Col xs={12} sm={12}>
            <PreviewMedia
              medias={Array.isArray(value) ? value : [value]}
              onRemoveMedia={media => {
                this.removeMedia(media);
              }}
            />
          </Col>
        )}
        <Col xs={12} sm={12}>
          <Dropzone
            ref="dropzone"
            onDrop={this.onDrop}
            multiple={multiple}
            accept={accept}
            minSize={minSize}
            maxSize={maxSize}
            inputProps={{ id: `${id}_field` }}
            disablePreview={disablePreview}
            className="image-uploader__dropzone--fullwidth">
            <div className="image-uploader__dropzone-label">
              {multiple ? dropzoneTextForFile : dropzoneTextForImage}
              <p style={{ textAlign: 'center' }}>
                <Button className="image-uploader__btn">
                  <FormattedMessage
                    id={
                      multiple
                        ? 'global.image_uploader.file.btn'
                        : 'global.image_uploader.image.btn'
                    }
                  />
                </Button>
              </p>
            </div>
          </Dropzone>
        </Col>
        {!disablePreview && (
          <Col xs={12} sm={12}>
            {value && (
              <p className="h5 text-center">
                <FormattedMessage id="global.image_uploader.image.preview" />
              </p>
            )}
            <div className="image-uploader__preview text-center">
              {value && Array.isArray(value) ? (
                value.map(media => (
                  <img alt="" key={media.id} src={media.url} className="img-responsive" />
                ))
              ) : (
                <img alt="" src={value.url} className="img-responsive" />
              )}
            </div>
            {value && (
              <Input
                type="checkbox"
                id={`${id}_delete`}
                name="image-uploader__delete"
                className="text-center"
                onChange={this.onToggleDelete}
                ref={c => {
                  this._deleteCheckbox = c;
                }}
                children={<FormattedMessage id="global.image_uploader.image.delete" />}
              />
            )}
          </Col>
        )}
      </Row>
    );
  }
}

export default ImageUpload;
