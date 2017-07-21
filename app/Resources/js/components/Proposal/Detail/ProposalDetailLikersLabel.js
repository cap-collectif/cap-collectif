import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';

const ProposalDetailLikersLabel = React.createClass({
  propTypes: {
    likers: PropTypes.array.isRequired,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
  },

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
      return likers[0].displayName;
    }
    if (likers.length > 1) {
      return (
        <FormattedMessage
          id="proposal.likers.count"
          values={{
            num: likers.length,
          }}
        />
      );
    }
    return null;
  },

  render() {
    const { likers, onBlur, onFocus, onMouseOut, onMouseOver } = this.props;
    const funcProps = {
      onFocus,
      onBlur,
      onMouseOver,
      onMouseOut,
    };

    if (likers.length > 0) {
      return (
        <span {...funcProps}>
          <i className="cap cap-heart-1 icon--red" />
          <Truncate>
            {this.getLabelText()}
          </Truncate>
        </span>
      );
    }
    return null;
  },
});

export default ProposalDetailLikersLabel;
