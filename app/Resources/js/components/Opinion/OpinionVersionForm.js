import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';

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
      isSubmitting: false,
    };
  },

  componentDidUpdate(prevProps, prevState) {

    CKEDITOR.basePath = "/js/ckeditor/";

    if (this.state.showModal && !prevState.showModal) {

      const ckeditorConfig = {
          "removePlugins": "elementspath",
          "toolbar":[
            ["Undo","Redo"],
            ["Format"],
            ["Bold","Italic","Underline","Strike"],
            ["NumberedList","BulletedList","-","Outdent","Indent","-","Blockquote"],
            ["Link","Unlink"],
            ["Image","Table","HorizontalRule"],
            ["Maximize"]
          ],
          "language":"fr",
          "skin":"bootstrapck",
          "extraPlugins":"autolink,autogrow",
          "extraAllowedContent":"a[!href,_src,target,class]"
      };

      let bodyEditor = CKEDITOR.replace("body-editor", ckeditorConfig);
      let commentEditor = CKEDITOR.replace("comment-editor", ckeditorConfig);

      bodyEditor.on('change', (evt) => {
        this.setState({body: evt.editor.getData()});
      });

      commentEditor.on('change', (evt) => {
        this.setState({comment: evt.editor.getData()});
      });

    }
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

      console.log('id valid', this.isValid());
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
      .createVersion(this.props.opinion, data)
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
      return new Validator(this.state.body).min(2);
    }

    if (field === 'comment') {
      return new Validator(this.state.comment).min(2);
    }

    return this.isValid('title') && this.isValid('body') && this.isValid('comment');
  },

});

export default OpinionVersionForm;
