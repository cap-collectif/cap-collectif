// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { loadProposals } from '../../../redux/modules/proposal';
import type { Dispatch } from '../../../types';

type Props = { dispatch: Dispatch };

export class ProposalListRandomMessage extends React.Component<Props> {
  render() {
    // eslint-disable-next-line react/prop-types
    const { dispatch } = this.props;
    return (
      <div>
        <p>
          <a href="#proposals-list" onClick={() => dispatch(loadProposals(null, true))}>
            <FormattedMessage id="proposal.random_search" />
          </a>{' '}
          <FormattedMessage id="proposal.change_filter" />
        </p>
      </div>
    );
  }
}

export default connect()(ProposalListRandomMessage);
