// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import Input from '../../Form/Input';
import LocalStorage from '../../../services/LocalStorageService';
import { changeOrder } from '../../../redux/modules/proposal';
import { PROPOSAL_AVAILABLE_ORDERS } from '../../../constants/ProposalConstants';
import type { Dispatch, State } from '../../../types';

type Props = {
  orderByVotes?: boolean,
  orderByComments?: boolean,
  orderByCost?: boolean,
  dispatch: Dispatch,
  order?: string,
  defaultSort?: ?string,
  stepId?: string,
  intl: IntlShape,
};

type ComponentState = {
  displayedOrders: Array<string>,
};

export class ProposalListOrderSorting extends React.Component<Props, ComponentState> {
  static defaultProps = {
    orderByVotes: false,
    orderByComments: false,
    orderByCost: false,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      // eslint-disable-next-line react/prop-types
      displayedOrders: PROPOSAL_AVAILABLE_ORDERS.concat(props.orderByComments ? ['comments'] : [])
        .concat(props.orderByCost ? ['expensive', 'cheap'] : [])
        .concat(props.orderByVotes ? ['votes', 'least-votes'] : []),
    };
  }

  componentDidMount() {
    const { dispatch, defaultSort, stepId } = this.props;
    const savedSort = LocalStorage.get('proposal.orderByStep');
    if (!savedSort || !Object.prototype.hasOwnProperty.call(savedSort, stepId)) {
      if (defaultSort) {
        dispatch(changeOrder(defaultSort));
      }
    } else {
      dispatch(changeOrder(savedSort[stepId]));
    }
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { order, dispatch, intl } = this.props;
    const { displayedOrders } = this.state;

    return (
      <div>
        <Input
          id="proposal-sorting"
          type="select"
          aria-label={intl.formatMessage({ id: 'global.filter' })}
          onChange={e => {
            dispatch(changeOrder(e.target.value));
          }}
          value={order}>
          {displayedOrders.map(choice => (
            <FormattedMessage key={choice} id={`global.filter_f_${choice}`}>
              {(message: string) => <option value={choice}>{message}</option>}
            </FormattedMessage>
          ))}
        </Input>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  order: state.proposal.order,
  stepId: state.project.currentProjectStepById || null,
});

const container = injectIntl(ProposalListOrderSorting);

export default connect(mapStateToProps)(container);
