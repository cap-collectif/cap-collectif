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
    opinionId: React.PropTypes.object,
    opinionBody: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin, CkeditorMixin],

  getInitialState() {
    return {
      title: '',
      body: this.props.opinionBody,
      comment: '',
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

  renderCreateButton() {
    return (
      <Button bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.show.bind(this) : null}>
        <i className="cap cap-add-1"></i>
        { ' ' + this.getIntlMessage('opinion.add_new_version')}
      </Button>
    );
  },

  render() {
    return (
      <div className="col-xs-5">
        <LoginOverlay children={this.renderCreateButton()} />
        <Modal {...this.props} animation={false} show={this.state.showModal}
               onHide={this.close.bind(this)} bsSize="large" aria-labelledby="contained-modal-title-lg"
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
            <Button onClick={this.close.bind(this)}>
              {this.getIntlMessage('global.cancel')}
            </Button>
            <Button
              disabled={this.state.isSubmitting}
              onClick={!this.state.isSubmitting ? this.create.bind(this) : null}
              bsStyle="primary"
            >
              {this.state.isSubmitting
                ? this.getIntlMessage('global.loading')
                : this.getIntlMessage('global.publish')
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

  create(e) {
    e.preventDefault();

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
      return new Validator(this.state.comment).min(2);
    }

    return this.isValid('title') && this.isValid('body') && this.isValid('comment');
  },

});

export default OpinionVersionForm;
