import React from 'react';
import classNames from 'classnames';
import CommentSection from '../../Comment/CommentSection';

const ProposalPageComments = React.createClass({
  displayName: 'ProposalPageComments',

  propTypes: {
    id: React.PropTypes.string.isRequired,
    form: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    isDraft: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const { className, isDraft, form, id } = this.props;
    const classes = {
      proposal__comments: true,
      [className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <CommentSection uri={`proposal_forms/${form.id}/proposals`} object={id} isDraft={isDraft} />
      </div>
    );
  },
});

export default ProposalPageComments;
