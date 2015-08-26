import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import CkeditorMixin from '../../utils/CkeditorMixin';

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
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin, CkeditorMixin],

  getDefaultProps() {
    return {
      opinionBody: '',
      mode: 'create',
      className: '',
      style: {},
      version: {},
    };
  },

  getInitialState() {
    return {
      title: this.props.version ? this.props.version.title : '',
      body: this.props.version ? this.props.version.body : this.props.opinionBody,
      comment: this.props.version ? this.props.version.comment : '',
      showModal: false,
      submitted: false,
      isSubmitting: false,
    };
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showModal && !prevState.showModal) {
      this.initializeCkeditor('body');
      this.initializeCkeditor('comment');
    }
  },

  getStyle(field) {
    return !this.isValid(field) ? 'error' : this.state.submitted ? 'success' : '';
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
            <div className="modal-top-warning">
              <p>
                { this.getIntlMessage('opinion.add_new_version_infos') }
              </p>
            </div>
            <form>
              <Input
                type="text"
                bsStyle={this.getStyle('title')}
                valueLink={this.linkState('title')}
                placeholder={this.getIntlMessage('global.title')}
                label={this.getIntlMessage('global.title')}
              />
              <Input
                type="textarea"
                ref="body"
                rows="10" cols="80"
                bsStyle={this.getStyle('body')}
                valueLink={this.linkState('body')}
                label={this.getIntlMessage('opinion.version.body')}
                help={this.getIntlMessage('opinion.version.body_helper')}
                wrapperClassName="excerpt small"
              />
              <Input
                type="textarea"
                ref="comment"
                rows="10" cols="80"
                bsStyle={this.getStyle('comment')}
                valueLink={this.linkState('comment')}
                label={this.getIntlMessage('opinion.version.comment')}
                help={this.getIntlMessage('opinion.version.comment_helper')}
                wrapperClassName="excerpt small"
              />
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

  isValid(field) {
    if (!this.state.submitted) {
      return true;
    }

    if (field === 'title') {
      return new Validator(this.state.title).min(2);
    }

    if (field === 'body') {
      return new Validator(this.state.body).notEqual(this.props.opinionBody);
    }

    if (field === 'comment') {
      return true;
    }

    return this.isValid('title') && this.isValid('body') && this.isValid('comment');
  },

});

export default OpinionVersionForm;
