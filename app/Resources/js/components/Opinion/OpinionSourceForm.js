import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';

import LoginStore from '../../stores/LoginStore';
import ValidatorMixin from '../../utils/ValidatorMixin';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import FlashMessages from '../Utils/FlashMessages';
import Input from '../Form/Input';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';

const OpinionSourceForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    categories: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, ValidatorMixin],

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
          notBlank: {message: 'source.constraints.title'},
        },
        body: {
          min: {value: 2, message: 'source.constraints.body'},
          notBlank: {message: 'source.constraints.body'},
        },
        category: {
          notBlank: {message: 'source.constraints.category'},
        },
        link: {
          notBlank: {message: 'source.constraints.link'},
          isUrl: {message: 'source.constraints.link'},
        },
      }
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

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form />;
    }
    return null;
  },

  renderCreateButton() {
    return (
      <Button id="source-form__add" bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.show.bind(null, this) : null}>
        <i className="cap cap-add-1"></i>
        { ' ' + this.getIntlMessage('opinion.add_new_source')}
      </Button>
    );
  },

  render() {
    if (!this.props.opinion.isContribuable) {
      return null;
    }

    return (
      <div>
        <LoginOverlay children={this.renderCreateButton()} />
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
              { this.getIntlMessage('source.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-top bg-info">
              <p>
                { this.getIntlMessage('source.infos') }
              </p>
            </div>
            <form id="source-form" ref="form">
              <Input
                ref="title"
                type="text"
                name="sourceTitle"
                groupClassName={this.getGroupStyle('title')}
                value={this.linkState('title')}
                label={this.getIntlMessage('source.title')}
                errors={this.renderFormErrors('title')}
              />
              <Input
                ref="category"
                type="select"
                name="sourceCategory"
                label={this.getIntlMessage('source.type')}
                groupClassName={this.getGroupStyle('category')}
                valueLink={this.linkState('category')}
                errors={this.renderFormErrors('category')}
              >
                <option value="" disabled selected>{this.getIntlMessage('global.select')}</option>
                {
                  this.props.categories.map((category) => {
                    return <option key={category.id} value={category.id}>{category.title}</option>;
                  })
                }
              </Input>
              <Input
                ref="link"
                type="text"
                name="sourceLink"
                label={this.getIntlMessage('source.link')}
                groupClassName={this.getGroupStyle('link')}
                valueLink={this.linkState('link')}
                errors={this.renderFormErrors('link')}
                placeholder="http://"
              />
              <Input
                ref="body"
                type="textarea"
                name="sourceBody"
                rows="10" cols="80"
                label={this.getIntlMessage('source.body')}
                groupClassName={this.getGroupStyle('body')}
                valueLink={this.linkState('body')}
                errors={this.renderFormErrors('body')}
              />
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

});

export default OpinionSourceForm;
