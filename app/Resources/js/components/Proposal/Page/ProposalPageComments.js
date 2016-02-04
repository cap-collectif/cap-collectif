import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import CommentSection from '../../Comment/CommentSection';

const ProposalPageComments = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    form: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const classes = {
      'proposal__comments': true,
      [this.props.className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <CommentSection
          uri={`proposal_forms/${this.props.form.id}/proposals`}
          object={this.props.id}
        />
      </div>
    );
  },

});

export default ProposalPageComments;
