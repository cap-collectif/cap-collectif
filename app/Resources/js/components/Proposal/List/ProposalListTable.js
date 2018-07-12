import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

type Props = {
  // columns?: Array<Object>,
  // data?: Array<Object>,
};

export class ProposalListTable extends React.Component<Props> {
  render() {
    const columns = [
      // Todo add translation
      { dataField: 'name', text: 'Proposal name' },
      { dataField: 'realisationPhase', text: 'Phase of realisation for proposal' },
      { dataField: 'status', text: 'Proposal status' },
      { dataField: 'author', text: 'Proposal author', hidden: true },
      { dataField: 'ref', text: 'Proposal reference' },
      { dataField: 'location', text: 'Proposal location' },
      { dataField: 'category', text: 'Proposal category' },
      { dataField: 'theme', text: 'Proposal theme' },
      { dataField: 'priceEstimation', text: 'Proposal price estimation' },
      { dataField: 'state', text: 'Proposal state' },
      { dataField: 'lastActivity', text: 'Last activity' },
      { dataField: 'publishAt', text: 'Publish at' },
    ];

    const data = [{ name: 'Element1', status: 'open' }, { name: 'Element2', status: 'close' }];

    return <BootstrapTable keyField="name" columns={columns} data={data} />;
  }
}

export default ProposalListTable;
