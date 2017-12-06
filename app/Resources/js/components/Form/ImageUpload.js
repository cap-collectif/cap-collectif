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
  preview: any,
  valueLink: Object,
  value: any,
  onChange: Function,
  id: string,
  className: string,
  multiple: boolean,
  accept: string,
  maxSize: number,
  minSize: number,
  disablePreview: boolean,
  files: Array<Object>,
};
type State = {
  preview: any,
  delete: boolean,
  files: Array<Object>,
};

export class ImageUpload extends React.Component<Props, State> {

  static defaultProps = {
      id: '',
      className: '',
      preview: null,
      multiple: false,
      maxSize: Infinity,
      minSize: 0,
      disablePreview: false,
      files: [],
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      preview: this.props.preview,
      delete: false,
      files: [],
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const value = nextProps.valueLink ? nextProps.valueLink.value : nextProps.value;
    if (value) {
      this.setState({
        preview: value.preview,
      });
    }
  }

  onDrop = (acceptedFiles: Array<File>) => {
    const { valueLink, onChange, multiple } = this.props;
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      Fetcher.postFormData('/files', formData)
        .then(json)
        .then(res => {
        console.log(res);
        this.setState(
          {
            delete: false,
            files: [...this.state.files, {
              id: res.id,
              name: res.name,
              url: res.url
            } ],
          },
          () => {
            this.uncheckDelete();
            const newValue = multiple ? this.state.files.map(fi => fi.id) : res.id;
            if (typeof newValue !== 'undefined') {
              if (valueLink) {
                valueLink.requestChange(newValue);
              }
              if (onChange && typeof onChange !== 'undefined') {
                onChange(newValue);
              }
            }
          },
      )});
    }
  }

  onOpenClick = () => {
    this.refs.dropzone.open();
  }

  onToggleDelete = () => {
    const { valueLink, onChange } = this.props;
    // $FlowFixMe
    const deleteValue = !this._deleteCheckbox.getWrappedInstance().getValue();
    if (deleteValue) {
      if (valueLink) {
        valueLink.requestChange(null);
      } else if (onChange && typeof onChange !== 'undefined') {
        onChange(null);
      }
    }
    this.setState({
      delete: deleteValue,
      preview: null,
    });
  }

  _deleteCheckbox: ?Input;

  uncheckDelete = () => {
    const ref = this._deleteCheckbox;
    if (ref) {
      // $FlowFixMe
      $(ref.getDOMNode()).prop('checked', false);
    }
  }

  removeMedia = (media) => {
    this.setState({
      files: this.state.files.filter(file => {
        return file !== media;
      }),
    });
  }

  render() {
    const {
      className,
      id,
      preview,
      multiple,
      accept,
      maxSize,
      minSize,
      disablePreview,
      files,
    } = this.props;
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
          <Col xs={12} sm={12} style={{ marginBottom: 5 }}>
            <PreviewMedia
              currentMedias={files}
              newMedias={this.state.files}
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
            // $FlowFixMe
            inputProps={{ id: `${id}_field` }}
            disablePreview={disablePreview}
            className="image-uploader__dropzone--fullwidth">
            <div className="image-uploader__dropzone-label">
              {multiple ? dropzoneTextForFile : dropzoneTextForImage}
              <p style={{ textAlign: 'center' }}>
                <Button className="image-uploader__btn">
                  {multiple ? (
                    <FormattedMessage id="global.image_uploader.file.btn" />
                  ) : (
                    <FormattedMessage id="global.image_uploader.image.btn" />
                  )}
                </Button>
              </p>
            </div>
          </Dropzone>
        </Col>
        {!disablePreview && (
          <Col xs={12} sm={12}>
            <p className="h5 text-center">
              {<FormattedMessage id="global.image_uploader.image.preview" />}
            </p>
            <div className="image-uploader__preview text-center">
              {this.state.preview && (
                <img alt="" src={this.state.preview} className="img-responsive" />
              )}
            </div>
            {(this.state.preview || preview) && (
                <Input
                  type="checkbox"
                  name="image-uploader__delete"
                  onChange={this.onToggleDelete}
                  ref={c => (this._deleteCheckbox = c)}
                  children={<FormattedMessage id="global.image_uploader.image.delete" />}
                />
              )}
          </Col>
        )}
      </Row>
    );
  }
};

export default ImageUpload;
