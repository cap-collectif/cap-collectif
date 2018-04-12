// @flow
import * as React from 'react';
import { Col } from 'react-bootstrap';
import ProposalListOrderSorting from './ProposalListOrderSorting';

type Props = { orderByVotes: boolean };

export class ProposalListRandomRow extends React.Component<Props> {
  render() {
    // eslint-disable-next-line react/prop-types
    const { orderByVotes } = this.props;
    return (
      <Col xs={4} md={4} id="proposal-list-pagination-select-footer">
        <ProposalListOrderSorting orderByVotes={orderByVotes} />
      </Col>
    );
  }
}

export default ProposalListRandomRow;
