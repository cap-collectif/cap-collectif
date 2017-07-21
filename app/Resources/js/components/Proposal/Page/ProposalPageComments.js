import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import CommentSection from '../../Comment/CommentSection';

const ProposalPageComments = React.createClass({
  displayName: 'ProposalPageComments',
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
    const {
      className,
      form,
      id,
    } = this.props;
    const classes = {
      proposal__comments: true,
      [className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <CommentSection
          uri={`proposal_forms/${form.id}/proposals`}
          object={id}
        />
      </div>
    );
  },

});

export default ProposalPageComments;
