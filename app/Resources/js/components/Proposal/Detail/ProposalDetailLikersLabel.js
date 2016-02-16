import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const ProposalDetailLikersLabel = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onMouseOver: React.PropTypes.func,
    onMouseOut: React.PropTypes.func,
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
    const { proposal } = this.props;
    if (proposal.likers.length === 1) {
      const name = proposal.likers[0].displayName;
      if (name.length > 30) {
        return name.substring(0, 30) + '...';
      }
      return name;
    }
    if (proposal.likers.length > 1) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('proposal.likers.count')}
          num={proposal.likers.length}
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
    const { proposal } = this.props;
    if (proposal.likers.length > 0) {
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
