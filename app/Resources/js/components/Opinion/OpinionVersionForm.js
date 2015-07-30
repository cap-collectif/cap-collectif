import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';
import OpinionActions from '../../actions/OpinionActions';

const Modal = ReactBootstrap.Modal;
const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;

const OpinionVersionForm = React.createClass({
  propTypes: {
    text: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      title: '',
      body: this.props.text,
      comment: '',
      showModal: false,
      submitted: false,
    };
  },

  getClasses(field) {
    return React.addons.classSet({
      'form-group': true,
      'has-error': !this.isValid(field),
    });
  },

  close() {
    this.setState({showModal: false});
  },

  show() {
    this.setState({showModal: true});
  },

  render() {

    if (!this.state.showModal) {
      return (
        <a className="btn btn-primary" onClick={this.show.bind(this)}>
          { this.getIntlMessage('opinion.add_new_version')}
        </a>
      );
    }

    return (
      <Modal {...this.props} show={true} onHide={this.close.bind(this)} bsSize='large' aria-labelledby='contained-modal-title-lg'>
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-lg'>
            { this.getIntlMessage('opinion.add_new_version') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-centered">
            { this.getIntlMessage('opinion.add_new_version_infos') }
          </p>
          <form>
            <Input
              type='text'
              valueLink={this.linkState('title')}
              placeholder={this.getIntlMessage('global.title')}
              label={this.getIntlMessage('global.title')}
            />
            <Input
              type='textarea'
              valueLink={this.linkState('body')}
              label={this.getIntlMessage('opinion.version.body')}
              help={this.getIntlMessage('opinion.version.body_helper')}
            />
            <Input
              type='textarea'
              valueLink={this.linkState('comment')}
              label={this.getIntlMessage('opinion.version.comment')}
              help={this.getIntlMessage('opinion.version.comment_helper')}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close.bind(this)}>{this.getIntlMessage('global.cancel')}</Button>
          <Button onClick={this.create.bind(this)} bsStyle='primary'>{this.getIntlMessage('global.publish')}</Button>
        </Modal.Footer>
      </Modal>
    );
  },

  create(e) {
    e.preventDefault();

    this.setState({ submitted: true}, () => {

      if (!this.isValid()) {
        return;
      }

      const data = this.state;
      delete data.showModal;
      OpinionActions.createVersion(this.props.opinion, data);
      // this.close();
    });
  },

  isValid(field) {

    if (!this.state.submitted) {
      return true;
    }

    if (field === 'title') {
      return new Validator(this.state.body).min(2);
    }

    if (field === 'body') {
      return new Validator(this.state.body).min(2);
    }

    if (field === 'comment') {
      return new Validator(this.state.body).min(2);
    }

    return this.isValid('title') && this.isValid('body') && this.isValid('comment');
  },

});

export default OpinionVersionForm;
