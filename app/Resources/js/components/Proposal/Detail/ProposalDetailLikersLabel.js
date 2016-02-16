import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const ProposalDetailLikersLabel = React.createClass({
  propTypes: {
    likers: PropTypes.array.isRequired,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      onFocus: () => {},
      onBlur: () => {},
      onMouseOver: () => {},
      onMouseOut: () => {},
    };
  },

  getLabelText() {
    const { likers } = this.props;
    if (likers.length === 1) {
      const name = likers[0].displayName;
      if (name.length > 30) {
        return name.substring(0, 30) + '...';
      }
      return name;
    }
    if (likers.length > 1) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('proposal.likers.count')}
          num={likers.length}
        />
      );
    }
    return null;
  },

  render() {
    const funcProps = {
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onMouseOver: this.props.onMouseOver,
      onMouseOut: this.props.onMouseOut,
    };
    const { likers } = this.props;
    if (likers.length > 0) {
      return (
        <span {...funcProps}>
          <i className="cap cap-heart-1 icon--red"></i>
          {this.getLabelText()}
        </span>
      );
    }
    return null;
  },
});

export default ProposalDetailLikersLabel;
