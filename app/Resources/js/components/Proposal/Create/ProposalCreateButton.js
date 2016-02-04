import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';

const ProposalCreateButton = React.createClass({
  propTypes: {
    handleClick: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  onClick() {
    if (!this.props.disabled && LoginStore.isLoggedIn()) {
      this.props.handleClick();
    }
  },

  render() {
    return (
      <LoginOverlay>
        <Button id="add-proposal" disabled={this.props.disabled} bsStyle="primary" onClick={() => this.onClick()}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('proposal.add')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default ProposalCreateButton;
