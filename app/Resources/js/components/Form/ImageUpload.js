// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { Row, Col, Button, Label } from 'react-bootstrap';
import Input from './Input';

const ImageUpload = React.createClass({
  propTypes: {
    preview: PropTypes.any,
    valueLink: PropTypes.object,
    value: PropTypes.any,
    onChange: PropTypes.func,
    id: PropTypes.string,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    accept: PropTypes.string,
    maxSize: PropTypes.number,
    minSize: PropTypes.number,
    disablePreview: PropTypes.bool,
    files: PropTypes.array.isRequired,
  },

  _deleteCheckbox: Input,

  getDefaultProps() {
    return {
      id: '',
      className: '',
      preview: null,
      multiple: false,
      maxSize: Infinity,
      minSize: 0,
      disablePreview: false,
      files: [],
    };
  },

  getInitialState() {
    const { preview, files } = this.props;
    return {
      preview,
      delete: false,
      files,
    };
  },

  componentWillReceiveProps(nextProps) {
    const value = nextProps.valueLink
      ? nextProps.valueLink.value
      : nextProps.value;
    if (value) {
      this.setState({
        preview: value.preview,
      });
    }
  },

  onDrop(droppedFiles) {
    const { valueLink, onChange, multiple } = this.props;
    let files = droppedFiles.filter(file => file !== null);
    if (files.length > 0 && files.length <= 5 && this.state.files.length <= 5) {
      files = files.concat(this.state.files);
      this.setState(
        {
          delete: false,
          files,
        },
        () => {
          this.uncheckDelete();
          const newValue = multiple ? files : files[0];
          if (typeof newValue !== 'undefined') {
            if (valueLink) {
              valueLink.requestChange(newValue);
            }
            if (onChange && typeof onChange !== 'undefined') {
              onChange(newValue);
            }
          }
        },
      );
    }
  },

  onOpenClick() {
    this.refs.dropzone.open();
  },

  onToggleDelete() {
    const { valueLink, onChange } = this.props;
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
  },

  uncheckDelete() {
    const ref = this._deleteCheckbox;
    if (ref) {
      $(ref.getDOMNode()).prop('checked', false);
    }
  },

  removeMedia(media) {
    this.setState({
      files: this.state.files.filter(file => {
        return file !== media;
      }),
    });
  },

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
    } = this.props;
    const classes = {
      'image-uploader': true,
    };
    if (className) {
      classes[className] = true;
    }

    return (
      <Row id={id} className={classNames(classes)}>
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
              {multiple
                ? <FormattedMessage id="global.image_uploader.file.dropzone" />
                : <FormattedMessage id="global.image_uploader.image.dropzone" />}
              <p style={{ textAlign: 'center' }}>
                <Button className="image-uploader__btn" bsStyle="primary">
                  {multiple
                    ? <FormattedMessage id="global.image_uploader.file.btn" />
                    : <FormattedMessage id="global.image_uploader.image.btn" />}
                </Button>
              </p>
            </div>
          </Dropzone>
        </Col>
        {disablePreview &&
          <Col xs={12} sm={12}>
            <Row>
              {this.state.files.map(file => {
                return (
                  <Col md={12}>
                    <Label bsStyle="info" style={{ marginRight: '5px' }}>
                      {file.name}{' '}
                      <i
                        style={{ cursor: 'pointer' }}
                        className="glyphicon glyphicon-remove"
                        onClick={this.removeMedia.bind(this, file)}
                      />
                    </Label>
                  </Col>
                );
              })}
            </Row>
          </Col>}
        {!disablePreview &&
          <Col xs={12} sm={12}>
            <p className="h5 text-center">
              {<FormattedMessage id="global.image_uploader.image.preview" />}
            </p>
            <div className="image-uploader__preview text-center">
              {this.state.preview && <img alt="" src={this.state.preview} />}
            </div>
            {(this.state.preview || preview) &&
              <Input
                type="checkbox"
                name="image-uploader__delete"
                onChange={this.onToggleDelete}
                ref={c => (this._deleteCheckbox = c)}
                children={
                  <FormattedMessage id="global.image_uploader.image.delete" />
                }
              />}
          </Col>}
      </Row>
    );
  },
});

export default ImageUpload;
