import LoginStore from '../../stores/LoginStore';
import ValidatorMixin from '../../utils/ValidatorMixin';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import FlashMessages from '../Utils/FlashMessages';

const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;
const Modal = ReactBootstrap.Modal;

const OpinionSourceForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    categories: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin, ValidatorMixin],

  getInitialState() {
    return {
      link: '',
      title: '',
      body: '',
      category: null,
      isSubmitting: false,
      showModal: false,
    };
  },

  componentDidMount() {
    this.initForm('form',
      {
        title: {
          min: {value: 2, message: 'source.constraints.title'},
        },
        body: {
          min: {value: 2, message: 'source.constraints.body'},
        },
        category: {
          notBlank: {message: 'source.constraints.category'},
        },
        link: {
          isUrl: {message: 'source.constraints.link'},
        },
      }
    );
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form={true} />;
    }
    return null;
  },

  renderCreateButton() {
    return (
      <Button id="addSourceButton" bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.show.bind(null, this) : null}>
        <i className="cap cap-add-1"></i>
        { ' ' + this.getIntlMessage('opinion.add_new_source')}
      </Button>
    );
  },

  render() {
    return (
      <div>
        <LoginOverlay children={this.renderCreateButton()} />
        <Modal {...this.props} animation={false} show={this.state.showModal} onHide={this.close.bind(null, this)}
               bsSize="large" aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('source.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-top bg-info">
              <p>
                { this.getIntlMessage('source.infos') }
              </p>
            </div>
            <form ref="form">
              <div className={'form-group ' + this.getGroupStyle('title')}>
                <label htmlFor="sourceTitle" className="control-label h5">
                  {this.getIntlMessage('source.title')}
                </label>
                <Input
                  ref="title"
                  type="text"
                  name="sourceTitle"
                  bsStyle={this.getFieldStyle('title')}
                  valueLink={this.linkState('title')}
                />
                {this.renderFormErrors('title')}
              </div>
              <div className={'form-group ' + this.getGroupStyle('category')}>
                <label htmlFor="sourceCategory" className="control-label h5">
                  {this.getIntlMessage('source.type')}
                </label>
                <Input
                  ref="category"
                  type="select"
                  name="sourceCategory"
                  bsStyle={this.getFieldStyle('category')}
                  valueLink={this.linkState('category')}
                >
                  <option value="" disabled selected>{this.getIntlMessage('global.select')}</option>
                  {
                    this.props.categories.map((category) => {
                      return <option key={category.id} value={category.id}>{category.title}</option>;
                    })
                  }
                </Input>
                {this.renderFormErrors('category')}
              </div>
              <div className={'form-group ' + this.getGroupStyle('link')}>
                <label htmlFor="sourceLink" className="control-label h5">
                  {this.getIntlMessage('source.link')}
                </label>
                <Input
                  ref="link"
                  type="text"
                  name="sourceLink"
                  bsStyle={this.getFieldStyle('link')}
                  valueLink={this.linkState('link')}
                  placeholder="http://"
                />
                {this.renderFormErrors('link')}
              </div>
              <div className={'form-group ' + this.getGroupStyle('body')}>
                <label htmlFor="sourceBody" className="control-label h5">
                  {this.getIntlMessage('source.body')}
                </label>
                <Input
                  ref="body"
                  type="textarea"
                  name="sourceBody"
                  rows="10" cols="80"
                  bsStyle={this.getFieldStyle('body')}
                  valueLink={this.linkState('body')}
                />
                {this.renderFormErrors('body')}
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close.bind(null, this)}>
              {this.getIntlMessage('global.cancel')}
            </Button>
            <Button
              disabled={this.state.isSubmitting}
              onClick={!this.state.isSubmitting ? this.create.bind(null, this) : null}
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

  create() {
    this.setState({submitted: true}, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({isSubmitting: true});

      const data = {
        link: this.state.link,
        title: this.state.title,
        body: this.state.body,
        Category: parseInt(this.state.category, 10),
      };

      if (this.props.opinion && this.props.opinion.parent) {
        OpinionActions
        .addVersionSource(this.props.opinion.parent.id, this.props.opinion.id, data)
        .then(() => {
          this.reload();
        })
        .catch(() => {
          this.setState({isSubmitting: false, submitted: false});
        });
        return;
      }

      OpinionActions
      .addSource(this.props.opinion.id, data)
      .then(() => {
        this.reload();
      })
      .catch(() => {
        this.setState({isSubmitting: false, submitted: false});
      });
    });
  },

});

export default OpinionSourceForm;
