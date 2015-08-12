import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;
const Modal = ReactBootstrap.Modal;

const OpinionSourceForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    categories: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      link: '',
      title: '',
      body: '',
      category: null,
      submitted: false,
      isSubmitting: false,
      showModal: false,
    };
  },

  getStyle(field) {
    return !this.isValid(field) ? 'error' : this.state.submitted ? 'success' : '';
  },

  renderCreateButton() {
    return (
      <a className="btn btn-primary" onClick={LoginStore.isLoggedIn() ? this.show.bind(this) : null}>
        <i className="cap cap-add-1"></i>
        { ' ' + this.getIntlMessage('opinion.add_new_source')}
      </a>
    );
  },

  render() {
    return (
      <div className="col-xs-5">
        <LoginOverlay children={this.renderCreateButton()} />
        <Modal {...this.props} animation={false} show={this.state.showModal} onHide={this.close.bind(this)}
               bsSize="large" aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('source.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-top-warning">
              <p>
                { this.getIntlMessage('source.infos') }
              </p>
            </div>
            <form>
              <Input
                type="text"
                bsStyle={this.getStyle('title')}
                valueLink={this.linkState('title')}
                label={this.getIntlMessage('source.title')}
              />
              <Input
                type="select"
                bsStyle={this.getStyle('type')}
                label={this.getIntlMessage('source.type')}
                valueLink={this.linkState('category')}
              >
                <option value="" disabled selected>{this.getIntlMessage('global.select')}</option>
                {
                  this.props.categories.map((category) => {
                    return <option value={category.id}>{category.title}</option>;
                  })
                }
              </Input>
              <Input
                type="text"
                bsStyle={this.getStyle('link')}
                valueLink={this.linkState('link')}
                placeholder="http://"
                label={this.getIntlMessage('source.link')}
              />
              <Input
                type="textarea"
                rows="10" cols="80"
                bsStyle={this.getStyle('body')}
                valueLink={this.linkState('body')}
                label={this.getIntlMessage('source.body')}
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

  reload() {
    this.setState(this.getInitialState());
    location.reload(); // TODO when enough time
    return true;
  },

  create(e) {
    e.preventDefault();
    this.setState({submitted: true}, () => {
      if (!this.isValid()) {
        return;
      }

      const data = {
        link: this.state.link,
        title: this.state.title,
        body: this.state.body,
        Category: parseInt(this.state.category, 10),
      };

      if (this.props.opinion && this.props.opinion.parent) {
        OpinionActions
        .addVersionSource(this.props.opinion.parent.id, this.props.opinion.id, data)
        .then(() => {this.reload()})
        .catch(() => {
          this.setState({submitted: false});
        });

        return ;
      }

      OpinionActions
      .addSource(this.props.opinionId, data)
      .then(() => {this.reload()})
      .catch(() => {
        this.setState({submitted: false});
      });

    });
  },

  isValid(field) {
    if (!this.state.submitted) {
      return true;
    }

    if (field === 'type') {
      return this.state.category !== null;
    }

    if (field === 'link') {
      return new Validator(this.state.link).isUrl();
    }

    if (field === 'title') {
      return new Validator(this.state.title).min(2);
    }

    if (field === 'body') {
      return new Validator(this.state.body).min(2);
    }

    return this.isValid('body') && this.isValid('link') && this.isValid('title');
  },

});

export default OpinionSourceForm;
