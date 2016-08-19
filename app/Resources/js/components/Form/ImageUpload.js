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
    const { preview } = this.props;
    return {
      preview: preview,
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
    const { valueLink } = this.props;
    const file = files.length > 0 ? files[0] : null;
    if (file) {
      this.setState({
        delete: false,
      }, () => {
        this.uncheckDelete();
        valueLink.requestChange(file);
      });
    }
  },

  onOpenClick() {
    this.refs.dropzone.open();
  },

  onToggleDelete() {
    const { valueLink } = this.props;
    const deleteValue = this._deleteCheckbox.getChecked();
    this.setState({
      delete: deleteValue,
      preview: null,
    });
    if (deleteValue) {
      valueLink.requestChange(false);
    }
  },

  uncheckDelete() {
    const ref = this._deleteCheckbox;
    if (ref) {
      $(ref.getInputDOMNode()).prop('checked', false);
    }
  },

  render() {
    const {
      className,
      id,
      preview,
    } = this.props;
    const classes = {
      'image-uploader': true,
      [className]: true,
    };
    return (
      <Row id={id} className={classNames(classes)}>
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
              this.state.preview &&
                <img role="presentation" src={this.state.preview} />
            }
          </div>
          {
            this.state.preview || preview
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
