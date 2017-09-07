import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { State } from '../../../types';
import Input from '../../Form/Input';
import { changeOrder, loadProposals } from '../../../redux/modules/proposal';
import { PROPOSAL_AVAILABLE_ORDERS } from '../../../constants/ProposalConstants';

export const ProposalListFilterSorting = React.createClass({
  propTypes: {
    orderByVotes: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      orderByVotes: false,
    };
  },

  getInitialState() {
    const { orderByVotes } = this.props;
    return {
      displayedOrders: PROPOSAL_AVAILABLE_ORDERS.concat(orderByVotes ? ['votes'] : []),
    };
  },

  render() {
    const { order, dispatch } = this.props;
    const { displayedOrders } = this.state;

    return (
      <div>
        <Input
          id="proposal-sorting"
          type="select"
          onChange={e => {
            dispatch(changeOrder(e.target.value));
            dispatch(loadProposals());
          }}
          value={order}>
          {displayedOrders.map(choice => (
            <FormattedMessage key={choice} id={`global.filter_f_${choice}`}>
              {message => <option value={choice}>{message}</option>}
            </FormattedMessage>
          ))}) }
        </Input>
      </div>
    );
  },
});

const mapStateToProps = (state: State) => {
  return {
    order: state.proposal.order,
  };
};

export default connect(mapStateToProps)(ProposalListFilterSorting);
