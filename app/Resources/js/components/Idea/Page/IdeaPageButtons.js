// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import IdeaReportButton from '../Report/IdeaReportButton';
import IdeaEditModal from '../Edit/IdeaEditModal';
import IdeaDeleteModal from '../Delete/IdeaDeleteModal';
import { showIdeaEditModal } from '../../../redux/modules/idea';

export const IdeaPageButtons = React.createClass({
  propTypes: {
    idea: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      showDeleteModal: false
    };
  },

  showDeleteModal() {
    this.toggleDeleteModal(true);
  },

  toggleDeleteModal(value) {
    this.setState({ showDeleteModal: value });
  },

  render() {
    const { idea, dispatch } = this.props;
    return (
      <div className="block idea__buttons">
        <ShareButtonDropdown id="idea-share-button" title={idea.title} url={idea._links.show} />{' '}
        <IdeaReportButton idea={idea} />
        <div className="pull-right">
          <EditButton
            id="idea-edit-button"
            author={idea.author}
            onClick={() => {
              dispatch(showIdeaEditModal(idea.id));
            }}
            editable={idea.canContribute}
          />{' '}
          <DeleteButton
            id="idea-delete-button"
            author={idea.author}
            onClick={this.showDeleteModal}
            deletable={idea.canContribute}
          />
        </div>
        <IdeaEditModal idea={idea} />
        <IdeaDeleteModal
          idea={idea}
          show={this.state.showDeleteModal}
          onToggleModal={this.toggleDeleteModal}
        />
      </div>
    );
  }
});

export default connect()(IdeaPageButtons);
