import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { Row, Col, Button } from 'react-bootstrap';
import Input from './Input';

const ImageUpload = React.createClass({
  propTypes: {
    preview: PropTypes.string,
    valueLink: PropTypes.object.isRequired,
    id: PropTypes.string,
    className: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      id: '',
      className: '',
      preview: null,
    };
  },

  getInitialState() {
    return {
      preview: this.props.preview,
      delete: false,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.valueLink.value) {
      this.setState({
        preview: nextProps.valueLink.value.preview,
      });
    }
  },

  onDrop(files) {
    const file = files.length > 0 ? files[0] : null;
    if (file) {
      this.setState({
        delete: false,
      }, () => {
        this.uncheckDelete();
        this.props.valueLink.requestChange(file);
      });
    }
  },

  onOpenClick() {
    this.refs.dropzone.open();
  },

  onToggleDelete() {
    const deleteValue = this._deleteCheckbox.getChecked();
    this.setState({
      delete: deleteValue,
      preview: null,
    });
    if (deleteValue) {
      this.props.valueLink.requestChange(false);
    }
  },

  uncheckDelete() {
    const ref = this._deleteCheckbox;
    if (ref) {
      $(ref.getInputDOMNode()).prop('checked', false);
    }
  },

  render() {
    const classes = {
      'image-uploader': true,
      [this.props.className]: true,
    };
    return (
      <Row id={this.props.id} className={classNames(classes)}>
        <Col xs={12} sm={4}>
          <Dropzone ref="dropzone" onDrop={this.onDrop} multiple={false} accept="image/*" className="image-uploader__dropzone">
            <div className="image-uploader__dropzone-label">
              {this.getIntlMessage('global.image_uploader.dropzone')}
            </div>
          </Dropzone>
          <Button className="image-uploader__btn" bsStyle="primary" onClick={this.onOpenClick}>
            {this.getIntlMessage('global.image_uploader.btn')}
          </Button>
        </Col>
        <Col xs={12} sm={8}>
          <p className="h5 text-center">
            {this.getIntlMessage('global.image_uploader.preview')}
          </p>
          <div className="image-uploader__preview text-center">
            {
              this.state.preview
                ? <img src={this.state.preview} />
                : null
            }
          </div>
          {
            this.state.preview || this.props.preview
            ? <Input
              type="checkbox"
              name="image-uploader__delete"
              onChange={this.onToggleDelete}
              ref={(c) => this._deleteCheckbox = c}
              label={this.getIntlMessage('global.image_uploader.delete')}
            />
            : null
          }
        </Col>
      </Row>
    );
  },
});

export default ImageUpload;
