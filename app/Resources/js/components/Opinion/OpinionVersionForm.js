import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import FormMixin from '../../utils/FormMixin';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import FlashMessages from '../Utils/FlashMessages';
import Input from '../Form/Input';

const OpinionVersionForm = React.createClass({
  propTypes: {
    opinionId: PropTypes.number.isRequired,
    opinionBody: PropTypes.string,
    version: PropTypes.object,
    mode: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    isContribuable: PropTypes.bool,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      opinionBody: '',
      mode: 'create',
      isContribuable: false,
      className: '',
      style: {},
      user: null,
    };
  },

  getInitialState() {
    const {
      opinionBody,
      version,
    } = this.props;
    return {
      form: {
        title: version ? version.title : '',
        body: version ? version.body : opinionBody,
        comment: version ? version.comment : null,
      },
      errors: {
        title: [],
        body: [],
        comment: [],
        confirm: [],
      },
      showModal: false,
      isSubmitting: false,
    };
  },

  componentDidMount() {
    const {
      mode,
      opinionBody,
    } = this.props;
    this.formValidationRules.body = {
      notEqual: { value: opinionBody, message: 'opinion.version.body_error' },
    };

    if (mode === 'edit') {
      this.formValidationRules.confirm = {
        isTrue: { message: 'opinion.version.confirm_error' },
      };
    }
  },

  close() {
    this.setState({ showModal: false });
  },

  show() {
    this.setState({ showModal: true });
  },

  create() {
    const { opinionId } = this.props;
    this.setState({
      submitted: true,
    }, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({ isSubmitting: true });

      OpinionActions
      .createVersion(opinionId, this.state.form)
      .then((version) => {
        this.setState(this.getInitialState());
        this.close();
        window.location.href = `${window.location.href}/versions/${version.slug}`;
        return true;
      })
      .catch(() => {
        this.setState({ isSubmitting: false, submitted: false });
      });
    });
  },

  update() {
    const {
      opinionId,
      version,
    } = this.props;
    this.setState({ submitted: true }, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({ isSubmitting: true });

      const data = {
        title: this.state.form.title,
        body: this.state.form.body,
        comment: this.state.form.comment,
      };

      OpinionActions
        .updateVersion(opinionId, version.id, data)
        .then(() => {
          this.setState(this.getInitialState());
          this.close();
          location.reload(); // TODO when enough time
          return true;
        })
        .catch(() => {
          this.setState({ isSubmitting: false, submitted: false });
        });
    });
  },

  isContribuable() {
    const { isContribuable } = this.props;
    return isContribuable;
  },


  handleSubmit() {
    const { mode } = this.props;
    if (this.state.isSubmitting) {
      return;
    }
    if (mode === 'create') {
      this.create();
      return;
    }
    this.update();
  },

  formValidationRules: {
    title: {
      notBlank: { message: 'opinion.version.title_error' },
      min: { value: 2, message: 'opinion.version.title_error' },
    },
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form />;
    }
    return null;
  },

  renderButton() {
    const {
      mode,
      user,
    } = this.props;
    if (mode === 'create') {
      return (
        <Button bsStyle="primary" onClick={user ? () => this.show() : null}>
          <i className="cap cap-add-1"></i>
          { ` ${this.getIntlMessage('opinion.add_new_version')}`}
        </Button>
      );
    }
    return (
      <Button className="opinion__action--edit pull-right btn--outline btn-dark-gray" onClick={() => this.show()}>
        <i className="cap cap-pencil-1"></i> {this.getIntlMessage('global.edit')}
      </Button>
    );
  },

  render() {
    const { style, className, user, features, mode } = this.props;
    if (!style.display) {
      style.display = 'inline-block';
    }
    return (
      <div className={className} style={style}>
        {this.isContribuable() ? <LoginOverlay user={user} features={features} children={this.renderButton()} /> : null}
        <Modal
          {...this.props}
          animation={false}
          show={this.state.showModal}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('opinion.add_new_version') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-top bg-info">
              <p>
                { this.getIntlMessage('opinion.add_new_version_infos') }
              </p>
            </div>
            <form>

              { mode === 'edit'
                ? <div className="alert alert-warning edit-confirm-alert">
                    <Input
                      name="confirm"
                      type="checkbox"
                      groupClassName={this.getGroupStyle('confirm')}
                      label={this.getIntlMessage('opinion.version.confirm')}
                      errors={this.renderFormErrors('confirm')}
                      checkedLink={this.linkState('form.confirm')}
                    />
                  </div>
                : null
              }

              <Input
                name="title"
                type="text"
                label={this.getIntlMessage('opinion.version.title')}
                groupClassName={this.getGroupStyle('title')}
                valueLink={this.linkState('form.title')}
                errors={this.renderFormErrors('title')}
              />

              <Input
                type="editor"
                label={this.getIntlMessage('opinion.version.body')}
                groupClassName={this.getGroupStyle('body')}
                help={this.getIntlMessage('opinion.version.body_helper')}
                valueLink={this.linkState('form.body')}
                errors={this.renderFormErrors('body')}
              />

              <Input
                type="editor"
                label={this.getIntlMessage('opinion.version.comment')}
                groupClassName={this.getGroupStyle('comment')}
                help={this.getIntlMessage('opinion.version.comment_helper')}
                valueLink={this.linkState('form.comment')}
                errors={this.renderFormErrors('comment')}
              />

            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.close()}>
              {this.getIntlMessage('global.cancel')}
            </Button>
            <Button
              disabled={this.state.isSubmitting}
              onClick={() => this.handleSubmit()}
              bsStyle="primary"
            >
              {this.state.isSubmitting
                ? this.getIntlMessage('global.loading')
                : (mode === 'create'
                  ? this.getIntlMessage('global.publish')
                  : this.getIntlMessage('global.edit')
                )
              }
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(OpinionVersionForm);
