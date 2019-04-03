// @flow
import * as React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import LocalStorage from '../../../services/LocalStorageService';
import { changeOrder } from '../../../redux/modules/proposal';
import { PROPOSAL_AVAILABLE_ORDERS } from '../../../constants/ProposalConstants';
import type { Dispatch, State } from '../../../types';
import Select from '../../Ui/Form/Select/Select';
import SelectOption from '../../Ui/Form/Select/SelectOption';

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
        <Select
          label={
            order
              ? intl.formatMessage({ id: `global.filter_f_${order}` })
              : intl.formatMessage({ id: 'global.filter' })
          }
          id="proposal-filter-sorting-button">
          {displayedOrders.map(choice => (
            <SelectOption
              key={choice}
              onClick={e => dispatch(changeOrder(e.currentTarget.value))}
              isSelected={choice === order}
              value={choice}>
              {intl.formatMessage({ id: `global.filter_f_${choice}` })}
            </SelectOption>
          ))}
        </Select>
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
