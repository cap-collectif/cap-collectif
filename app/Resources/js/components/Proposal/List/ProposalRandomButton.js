import React from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';

const ProposalRandomButton = React.createClass({
  propTypes: {
    isLoading: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      isLoading,
      onClick,
    } = this.props;
    return (
      <div className="pagination--custom  text-center">
        <Button
          bsStyle="primary"
          disabled={isLoading}
          onClick={onClick}
        >
          {
            isLoading
            ? this.getIntlMessage('global.loading')
            : this.getIntlMessage('proposal.random_search')
          }
        </Button>
      </div>
    );
  },

});

export default ProposalRandomButton;
