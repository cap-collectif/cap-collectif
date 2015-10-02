import LoginStore from '../../stores/LoginStore';
import ValidatorMixin from '../../utils/ValidatorMixin';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import CkeditorMixin from '../../utils/CkeditorMixin';
import FlashMessages from '../Utils/FlashMessages';

const Modal = ReactBootstrap.Modal;
const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;

const OpinionVersionForm = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
    opinionBody: React.PropTypes.string,
    version: React.PropTypes.object,
    mode: React.PropTypes.string,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin, CkeditorMixin, ValidatorMixin],

  getDefaultProps() {
    return {
      opinionBody: '',
      mode: 'create',
      className: '',
      style: {},
    };
  },

  getInitialState() {
    return {
      title: this.props.version ? this.props.version.title : '',
      body: this.props.version ? this.props.version.body : this.props.opinionBody,
      comment: this.props.version ? this.props.version.comment : null,
      showModal: false,
      isSubmitting: false,
    };
  },

  componentDidMount() {

    const constraints = {
      title: {
        notBlank: {message: 'opinion.version.title_error'},
        min: {value: 2, message: 'opinion.version.title_error'},
      },
      body: {
        notEqual: {value: this.props.opinionBody, message: 'opinion.version.body_error'},
      },
    };
    if (this.props.mode === 'edit') {
      constraints.confirm = {
        isTrue: {message: 'opinion.version.confirm_error'},
      };
    }
    this.initForm('form', constraints);
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showModal && !prevState.showModal) {
      this.initializeCkeditor('body');
      this.initializeCkeditor('comment');
    }
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form={true} />;
    }
    return null;
  },

  renderButton() {
    if (this.props.mode === 'create') {
      return (
        <Button bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.show.bind(null, this) : null}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.add_new_version')}
        </Button>
      );
    }
    return (
      <Button className="opinion__action--edit pull-right btn--outline btn-dark-gray" onClick={this.show.bind(null, this)}>
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
        <LoginOverlay children={this.renderButton()} />
        <Modal {...this.props}
          animation={false} show={this.state.showModal}
          onHide={this.close.bind(null, this)} bsSize="large" aria-labelledby="contained-modal-title-lg"
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
            <form ref="form">
              { this.props.mode === 'edit'
                ? <div className={'form-group ' + this.getGroupStyle('confirm')}>
                    <Input
                      ref="confirm"
                      name="confirm"
                      type="checkbox"
                      bsStyle={this.getFieldStyle('confirm')}
                      label={this.getIntlMessage('opinion.version.confirm')}
                    />
                    {this.renderFormErrors('confirm')}
                  </div>
                : null
              }
              <div className={'form-group ' + this.getGroupStyle('title')}>
                <label htmlFor="title" className="control-label h5">
                  {this.getIntlMessage('opinion.version.title')}
                </label>
                <Input
                  ref="title"
                  name="title"
                  type="text"
                  bsStyle={this.getFieldStyle('title')}
                  valueLink={this.linkState('title')}
                />
                {this.renderFormErrors('title')}
              </div>
              <div className={'form-group ' + this.getGroupStyle('body')}>
                <label htmlFor="body" className="control-label h5">
                  {this.getIntlMessage('opinion.version.body')}
                </label>
                <span className="help-block">
                  {this.getIntlMessage('opinion.version.body_helper')}
                </span>
                <Input
                  type="textarea"
                  name="body"
                  ref="body"
                  rows="10" cols="80"
                  bsStyle={this.getFieldStyle('body')}
                  valueLink={this.linkState('body')}
                />
                {this.renderFormErrors('body')}
              </div>
              <div className={'form-group ' + this.getGroupStyle('comment')}>
                <label htmlFor="comment" className="control-label h5">
                  {this.getIntlMessage('opinion.version.comment')}
                </label>
                <span className="help-block">
                  {this.getIntlMessage('opinion.version.comment_helper')}
                </span>
                <Input
                  type="textarea"
                  ref="comment"
                  rows="10" cols="80"
                  bsStyle={this.getFieldStyle('comment')}
                  valueLink={this.linkState('comment')}
                />
                {this.renderFormErrors('comment')}
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close.bind(null, this)}>
              {this.getIntlMessage('global.cancel')}
            </Button>
            <Button
              disabled={this.state.isSubmitting}
              onClick={this.state.isSubmitting
                ? null
                : (this.props.mode === 'create'
                  ? this.create.bind(null, this)
                  : this.update.bind(null, this)
                )
              }
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

  close() {
    this.setState({showModal: false});
  },

  show() {
    this.setState({showModal: true});
  },

  create() {
    this.setState({submitted: true}, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({isSubmitting: true});

      const data = {
        title: this.state.title,
        body: this.state.body,
        comment: this.state.comment,
      };

      OpinionActions
      .createVersion(this.props.opinionId, data)
      .then((version) => {
        this.setState(this.getInitialState());
        this.close();
        window.location.href = window.location.href + '/versions/' + version.slug;
        return true;
      })
      .catch(() => {
        this.setState({isSubmitting: false, submitted: false});
      });
    });
  },

  update() {
    this.setState({submitted: true}, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({isSubmitting: true});

      const data = {
        title: this.state.title,
        body: this.state.body,
        comment: this.state.comment,
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
          this.setState({isSubmitting: false, submitted: false});
        });
    });
  },

});

export default OpinionVersionForm;
