// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import OpinionSourceReportButton from './OpinionSourceReportButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';
import OpinionSourceDeleteModal from './OpinionSourceDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import OpinionSourceVoteBox from './OpinionSourceVoteBox';
import { showSourceEditModal } from '../../../redux/modules/opinion';

const OpinionSourceButtons = React.createClass({
  propTypes: {
    source: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      isDeleting: false,
    };
  },

  openDeleteModal() {
    this.setState({ isDeleting: true });
  },

  closeDeleteModal() {
    this.setState({ isDeleting: false });
  },

  render() {
    const { source, dispatch } = this.props;
    return (
      <div>
        <OpinionSourceVoteBox source={source} /> <OpinionSourceReportButton source={source} />
        <EditButton
          onClick={() => {
            dispatch(showSourceEditModal(source.id));
          }}
          author={source.author}
          editable={source.isContribuable}
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
  },
});

export default connect()(OpinionSourceButtons);
