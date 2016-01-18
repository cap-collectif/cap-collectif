import React from 'react';
import {IntlMixin} from 'react-intl';

import LoginStore from '../../../stores/LoginStore';
import OpinionSourceReportButton from './OpinionSourceReportButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';
import OpinionSourceDeleteModal from './OpinionSourceDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import OpinionSourceVoteBox from './OpinionSourceVoteBox';

const OpinionSourceButtons = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isEditing: false,
      isDeleting: false,
    };
  },

  isTheUserTheAuthor() {
    if (this.props.source.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.source.author.uniqueId;
  },

  openEditModal() {
    this.setState({isEditing: true});
  },

  closeEditModal() {
    this.setState({isEditing: false});
  },

  openDeleteModal() {
    this.setState({isDeleting: true});
  },

  closeDeleteModal() {
    this.setState({isDeleting: false});
  },

  render() {
    const {source} = this.props;
    return (
      <div>
        <OpinionSourceVoteBox
          source={source}
        />
        { ' ' }
        <OpinionSourceReportButton
          source={source}
        />
        <EditButton
          onClick={this.openEditModal}
          author={source.author}
          editable={source.isContribuable}
          className="source__btn--edit btn-xs btn-dark-gray btn--outline"
        />
        <OpinionSourceFormModal
          source={source}
          show={this.state.isEditing}
          onClose={this.closeEditModal}
        />
        {' '}
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

export default OpinionSourceButtons;
