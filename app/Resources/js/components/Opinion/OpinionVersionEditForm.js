// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import Input from '../Form/Input';

const OpinionVersionCreateForm = React.createClass({
  propTypes: {
    versionId: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  // getInitialState() {
  //   const {
  //     version,
  //   } = this.props;
  //   return {
  //     form: {
  //       title: version ? version.title : '',
  //       body: version ? version.body : opinionBody,
  //       comment: version ? version.comment : null,
  //     },
  //   };
  // },

  // componentDidMount() {
  //   const {
  //     mode,
  //     opinionBody,
  //   } = this.props;
  //   this.formValidationRules.body = {
  //     notEqual: { value: opinionBody, message: 'opinion.version.body_error' },
  //   };
  //
  //   if (mode === 'edit') {
  //     this.formValidationRules.confirm = {
  //       isTrue: { message: 'opinion.version.confirm_error' },
  //     };
  //   }
  // },

  // update() {
  //   const {
  //     opinionId,
  //     version,
  //   } = this.props;
  //   this.setState({ submitted: true }, () => {
  //     if (!this.isValid()) {
  //       return;
  //     }
  //
  //     this.setState({ isSubmitting: true });
  //
  //     const data = {
  //       title: this.state.form.title,
  //       body: this.state.form.body,
  //       comment: this.state.form.comment,
  //     };
  //
  //     if (version) {
  //       OpinionActions
  //         .updateVersion(opinionId, version.id, data)
  //         .then(() => {
  //           this.setState(this.getInitialState());
  //           this.close();
  //           location.reload(); // TODO when enough time
  //           return true;
  //         })
  //         .catch(() => {
  //           this.setState({ isSubmitting: false, submitted: false });
  //         });
  //     }
  //   });
  // },
  //
  // formValidationRules: {
  //   title: {
  //     notBlank: { message: 'opinion.version.title_error' },
  //     min: { value: 2, message: 'opinion.version.title_error' },
  //   },
  //   body: undefined,
  //   confirm: undefined,
  // },

  render() {
    // const { style, className, user, features, mode } = this.props;
    return (
      <form>
        <div className="alert alert-warning edit-confirm-alert">
          <Input
            name="confirm"
            type="checkbox"
            groupClassName={this.getGroupStyle('confirm')}
            label={this.getIntlMessage('opinion.version.confirm')}
          />
        </div>
        <Input
          name="title"
          type="text"
          label={this.getIntlMessage('opinion.version.title')}
          groupClassName={this.getGroupStyle('title')}
        />
        <Input
          name="body"
          type="editor"
          label={this.getIntlMessage('opinion.version.body')}
          groupClassName={this.getGroupStyle('body')}
          help={this.getIntlMessage('opinion.version.body_helper')}
        />
        <Input
          name="comment"
          type="editor"
          label={this.getIntlMessage('opinion.version.comment')}
          groupClassName={this.getGroupStyle('comment')}
          help={this.getIntlMessage('opinion.version.comment_helper')}
        />
      </form>
    );
  },
});

const mapStateToProps = state => ({
  versionId: state.opinion.currentVersionId,
});

export default connect(mapStateToProps)(OpinionVersionCreateForm);
