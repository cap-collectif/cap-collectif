import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';

const ProposalCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { disabled, handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button
          id="add-proposal"
          disabled={disabled}
          bsStyle="primary"
          onClick={disabled ? null : handleClick}
        >
          <i className="cap cap-add-1"></i>
          { ` ${this.getIntlMessage('proposal.add')}`}
        </Button>
      </LoginOverlay>
    );
  },

});

export default ProposalCreateButton;
