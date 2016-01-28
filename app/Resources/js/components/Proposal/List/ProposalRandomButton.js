import React from 'react';
import {IntlMixin} from 'react-intl';
import {Button} from 'react-bootstrap';

const ProposalRandomButton = React.createClass({
  propTypes: {
    isLoading: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <div className="pagination--custom  text-center">
        <Button
          bsStyle="primary"
          disabled={this.props.isLoading}
          onClick={this.props.onClick}
        >
          {
            this.props.isLoading
            ? this.getIntlMessage('global.loading')
            : this.getIntlMessage('proposal.random_search')
          }
        </Button>
      </div>
    );
  },

});

export default ProposalRandomButton;
