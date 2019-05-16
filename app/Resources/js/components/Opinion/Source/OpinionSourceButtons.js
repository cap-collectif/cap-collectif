// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionSourceReportButton from './OpinionSourceReportButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';
import OpinionSourceDeleteModal from './OpinionSourceDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import OpinionSourceVoteBox from './OpinionSourceVoteBox';
import { showSourceEditModal } from '../../../redux/modules/opinion';
import type { OpinionSourceButtons_source } from '~relay/OpinionSourceButtons_source.graphql';
import type { OpinionSourceButtons_sourceable } from '~relay/OpinionSourceButtons_sourceable.graphql';

type Props = {
  source: OpinionSourceButtons_source,
  sourceable: OpinionSourceButtons_sourceable,
  dispatch: Function,
};

type State = {
  isDeleting: boolean,
};

class OpinionSourceButtons extends React.Component<Props, State> {
  state = {
    isDeleting: false,
  };

  openDeleteModal = () => {
    this.setState({ isDeleting: true });
  };

  closeDeleteModal = () => {
    this.setState({ isDeleting: false });
  };

  render() {
    const { source, sourceable, dispatch } = this.props;
    return (
      <div>
        {/* $FlowFixMe */}
        <OpinionSourceVoteBox source={source} />
        <OpinionSourceReportButton sourceable={sourceable} source={source} />{' '}
        <EditButton
          onClick={() => {
            dispatch(showSourceEditModal(source.id));
          }}
          author={{ uniqueId: source.author.slug }}
          editable={source.contribuable}
          className="btn-xs btn--outline source__btn--edit"
        />{' '}
        <OpinionSourceFormModal sourceable={sourceable} source={source} />
        <DeleteButton
          onClick={this.openDeleteModal}
          author={{ uniqueId: source.author.slug }}
          className="btn-xs source__btn--delete"
        />
        {/* $FlowFixMe */}
        <OpinionSourceDeleteModal
          source={source}
          show={this.state.isDeleting}
          onClose={this.closeDeleteModal}
        />
      </div>
    );
  }
}

const container = connect()(OpinionSourceButtons);
export default createFragmentContainer(container, {
  source: graphql`
    fragment OpinionSourceButtons_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        id
        slug
      }
      contribuable
      ...OpinionSourceVoteBox_source @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionSourceReportButton_source @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionSourceFormModal_source
      ...OpinionSourceDeleteModal_source
    }
  `,
  sourceable: graphql`
    fragment OpinionSourceButtons_sourceable on Sourceable
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionSourceFormModal_sourceable @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionSourceReportButton_sourceable
    }
  `,
});
