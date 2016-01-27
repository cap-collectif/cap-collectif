import React, {PropTypes} from 'react';
import {IntlMixin} from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';
import CategoriesStore from '../../../stores/CategoriesStore';

const OpinionSourceForm = React.createClass({
  propTypes: {
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
    opinion: PropTypes.object.isRequired,
    source: PropTypes.object,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getInitialState() {
    const {source} = this.props;
    return {
      form: {
        link: source ? source.link : '',
        title: source ? source.title : '',
        body: source ? source.body : '',
        category: source ? source.category.id : null,
        check: source ? false : true,
      },
      errors: {
        link: [],
        title: [],
        body: [],
        category: [],
        check: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting) {
      if (this.isValid()) {
        const {opinion, source, onSubmitSuccess, onSubmitFailure} = this.props;


        const tmpFixData = this.state.form;
        tmpFixData.Category = parseInt(tmpFixData.category, 10);
        delete tmpFixData.category;
        delete tmpFixData.check;

        if (!source) {
          return OpinionSourceActions
            .add(opinion, tmpFixData)
            .then(() => {
              this.setState(this.getInitialState());
              onSubmitSuccess();
            })
            .catch(onSubmitFailure)
          ;
        }

        return OpinionSourceActions
          .update(opinion, source.id, tmpFixData)
          .then(onSubmitSuccess)
          .catch(onSubmitFailure)
        ;
      }

      this.props.onValidationFailure();
    }
  },

  formValidationRules: {
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
    check: {
      isTrue: {message: 'source.constraints.check'},
    },
  },

  renderFormErrors(field) {
    return (
      <FlashMessages
        errors={this.getErrorsMessages(field)}
        form
      />
    );
  },

  render() {
    const {source} = this.props;
    return (
      <form id="source-form" ref="form">
        {source
          ? <div className="alert alert-warning edit-confirm-alert">
              <Input
                  type="checkbox"
                  ref="check"
                  id="sourceEditCheck"
                  valueLink={this.linkState('form.check')}
                  label={this.getIntlMessage('source.check')}
                  labelClassName=""
                  groupClassName={this.getGroupStyle('check')}
                  errors={this.renderFormErrors('check')}
              />
            </div>
          : null
        }
        <Input
          type="select"
          ref="category"
          id="sourceCategory"
          valueLink={this.linkState('form.category')}
          label={this.getIntlMessage('source.type')}
          groupClassName={this.getGroupStyle('category')}
          errors={this.renderFormErrors('category')}
        >
          {source
            ? null
            : <option value="" disabled selected>
                {this.getIntlMessage('global.select')}
              </option>
          }
          {
            CategoriesStore.categories.map((category) => {
              return (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.title}
                </option>
              );
            })
          }
        </Input>
        <Input
          ref="link"
          type="text"
          valueLink={this.linkState('form.link')}
          name="sourceLink"
          label={this.getIntlMessage('source.link')}
          groupClassName={this.getGroupStyle('link')}
          errors={this.renderFormErrors('link')}
          placeholder="http://"
        />
        <Input
          type="text"
          valueLink={this.linkState('form.title')}
          ref="title"
          id="sourceTitle"
          groupClassName={this.getGroupStyle('title')}
          label={this.getIntlMessage('source.title')}
          errors={this.renderFormErrors('title')}
        />
        <Input
          type="editor"
          id="sourceBody"
          valueLink={this.linkState('form.body')}
          label={this.getIntlMessage('source.body')}
          groupClassName={this.getGroupStyle('body')}
          errors={this.renderFormErrors('body')}
        />
      </form>
    );
  },

});

export default OpinionSourceForm;
