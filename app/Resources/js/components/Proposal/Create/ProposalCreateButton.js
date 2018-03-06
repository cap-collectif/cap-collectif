import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';

const ProposalCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const { disabled, handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button
          id="add-proposal"
          disabled={disabled}
          bsStyle="primary"
          onClick={disabled ? null : handleClick}>
          <i className="cap cap-add-1" />
          <FormattedMessage id="proposal.add" />
        </Button>
      </LoginOverlay>
    );
  }
});

export default ProposalCreateButton;
