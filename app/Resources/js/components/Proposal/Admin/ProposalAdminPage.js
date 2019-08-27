// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isDirty } from 'redux-form';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalAdminPageTabs from './ProposalAdminPageTabs';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { State } from '../../../types';

export type Props = {| proposalId: number, dirty: boolean |};

const onUnload = () => {
  return true;
};

const component = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.proposal !== null) {
      return <ProposalAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class ProposalAdminPage extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.dirty === false && this.props.dirty === true) {
      window.addEventListener('beforeunload', onUnload);
    }

    if (this.props.dirty === false) {
      window.removeEventListener('beforeunload', onUnload);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

  render() {
    return (
      <div className="admin_proposal_form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalAdminPageQuery($id: ID!, $count: Int!, $cursor: String) {
              proposal: node(id: $id) {
                ...ProposalAdminPageTabs_proposal
              }
            }
          `}
          variables={{
            id: this.props.proposalId,
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
          }}
          render={component}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  dirty:
    isDirty('proposal-admin-edit')(state) ||
    isDirty('proposal-admin-selections')(state) ||
    isDirty('proposal-admin-evaluation')(state) ||
    isDirty('proposal-admin-status')(state),
});
export default connect(mapStateToProps)(ProposalAdminPage);
