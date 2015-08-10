import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;

const OpinionSourceForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      body: this.props.text,
      submitted: false,
      isSubmitting: false,
    };
  },

  getClasses(field) {
    return React.addons.classSet({
      'form-group': true,
      'has-error': !this.isValid(field),
    });
  },


  renderCreateButton() {
    return (
      <a className="btn btn-primary" onClick={LoginStore.isLoggedIn() ? this.show.bind(this) : null}>
        <i className="cap cap-add-1"></i>
        { ' ' + this.getIntlMessage('opinion.add_new_version')}
      </a>
    );
  },

  render() {
    return (
      <div className="col-xs-5">
        <LoginOverlay children={this.renderCreateButton()} />
        <Modal {...this.props} animation={false} show={this.state.showModal} onHide={this.close.bind(this)} bsSize='large' aria-labelledby='contained-modal-title-lg'>
          <Modal.Header closeButton>
            <Modal.Title id='contained-modal-title-lg'>
              { this.getIntlMessage('source.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-centered">
              { this.getIntlMessage('sources.infos') }
            </p>
            <form>
              <Input
                type='text'
                valueLink={this.linkState('link')}
                placeholder={this.getIntlMessage('global.link')}
                label={this.getIntlMessage('global.link')}
              />
              <Input
                type='text'
                valueLink={this.linkState('title')}
                placeholder={this.getIntlMessage('global.title')}
                label={this.getIntlMessage('global.title')}
              />
              <Input
                type='textarea'
                name='body-editor'
                rows="10" cols="80"
                valueLink={this.linkState('body')}
                label={this.getIntlMessage('opinion.version.body')}
                help={this.getIntlMessage('opinion.version.body_helper')}
                wrapperClassName="excerpt small"
              />
              <Input
                type='textarea'
                name='comment-editor'
                rows="10" cols="80"
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
              bsStyle='primary'
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

  create(e) {
    e.preventDefault();

    this.setState({ submitted: true}, () => {

      if (!this.isValid()) {
        return;
      }

      const data = {
        body: this.state.body,
        type: this.props.type === 'yes' ? 1 : 0,
      };

      OpinionActions
      .addVersionSource(this.props.opinion.parent.id, this.props.opinion.id, data)
      .then(() => {
        this.setState(this.getInitialState());
        location.reload(); // TODO when enough time
        return true;
      })
      .catch(() => {
        this.setState({submitted: false});
      });

    });
  },

  isValid(field) {

    if (!this.state.submitted) {
      return true;
    }

    if (field === 'body') {
      return new Validator(this.state.body).min(2);
    }

    return this.isValid('body');
  },

});

export default OpinionSourceForm;
