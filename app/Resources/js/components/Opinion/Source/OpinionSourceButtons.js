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

type Props = {
  source: OpinionSourceButtons_source,
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
    const { source, dispatch } = this.props;
    return (
      <div>
        <OpinionSourceVoteBox source={source} />
        <OpinionSourceReportButton source={source} />
        <EditButton
          onClick={() => {
            dispatch(showSourceEditModal(source.id));
          }}
          author={source.author}
          editable={source.contribuable}
          className="source__btn--edit btn-xs btn-dark-gray btn--outline"
        />
        <OpinionSourceFormModal source={source} />{' '}
        <DeleteButton
          onClick={this.openDeleteModal}
          author={source.author}
          className="source__btn--delete btn-xs"
        />
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
export default createFragmentContainer(
  container,
  graphql`
    fragment OpinionSourceButtons_source on Source {
      id
      author {
        id
        slug
      }
      contribuable
      ...OpinionSourceVoteBox_source
      ...OpinionSourceReportButton_source
      ...OpinionSourceFormModal_source
      #...OpinionSourceDeleteModal_source
    }
  `,
);
