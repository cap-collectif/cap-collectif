import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../stores/LoginStore';
import FormMixin from '../../utils/FormMixin';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import FlashMessages from '../Utils/FlashMessages';
import Input from '../Form/Input';

const OpinionVersionForm = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
    opinionBody: React.PropTypes.string,
    version: React.PropTypes.object,
    mode: React.PropTypes.string,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    isContribuable: React.PropTypes.bool,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      opinionBody: '',
      mode: 'create',
      isContribuable: false,
      className: '',
      style: {},
    };
  },

  getInitialState() {
    return {
      form: {
        title: this.props.version ? this.props.version.title : '',
        body: this.props.version ? this.props.version.body : this.props.opinionBody,
        comment: this.props.version ? this.props.version.comment : null,
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
    this.formValidationRules.body = {
      notEqual: { value: this.props.opinionBody, message: 'opinion.version.body_error' },
    };

    if (this.props.mode === 'edit') {
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
    this.setState({
      submitted: true,
    }, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({ isSubmitting: true });

      OpinionActions
      .createVersion(this.props.opinionId, this.state.form)
      .then((version) => {
        this.setState(this.getInitialState());
        this.close();
        window.location.href = window.location.href + '/versions/' + version.slug;
        return true;
      })
      .catch(() => {
        this.setState({ isSubmitting: false, submitted: false });
      });
    });
  },

  update() {
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
        .updateVersion(this.props.opinionId, this.props.version.id, data)
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
    return this.props.isContribuable;
  },


  handleSubmit() {
    if (this.state.isSubmitting) {
      return;
    }
    if (this.props.mode === 'create') {
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
    if (this.props.mode === 'create') {
      return (
        <Button bsStyle="primary" onClick={LoginStore.isLoggedIn() ? () => this.show() : null}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.add_new_version')}
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
    const style = this.props.style;
    if (!this.props.style.display) {
      style.display = 'inline-block';
    }
    return (
      <div className={this.props.className} style={style}>
        {this.isContribuable() ? <LoginOverlay children={this.renderButton()} /> : null}
        <Modal
          {...this.props}
          animation={false}
          show={this.state.showModal}
          onHide={this.close.bind(null, this)}
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

              { this.props.mode === 'edit'
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
                : (this.props.mode === 'create'
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

export default OpinionVersionForm;
