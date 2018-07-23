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
import type { OpinionSourceButtons_source } from './__generated__/OpinionSourceButtons_source.graphql';
import type { OpinionSourceButtons_sourceable } from './__generated__/OpinionSourceButtons_sourceable.graphql';

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
        <OpinionSourceVoteBox source={source} />
        <OpinionSourceReportButton sourceable={sourceable} source={source} />
        <EditButton
          onClick={() => {
            dispatch(showSourceEditModal(source.id));
          }}
          author={{ uniqueId: source.author.slug }}
          editable={source.contribuable}
          className="source__btn--edit btn-xs btn-dark-gray btn--outline"
        />
        <OpinionSourceFormModal sourceable={sourceable} source={source} />{' '}
        <DeleteButton
          onClick={this.openDeleteModal}
          author={{ uniqueId: source.author.slug }}
          className="source__btn--delete btn-xs"
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
      @argumentDefinitions(isAuthenticated: { type: "Boolean" }) {
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
    fragment OpinionSourceButtons_sourceable on Sourceable {
      ...OpinionSourceFormModal_sourceable
    }
  `,
});
