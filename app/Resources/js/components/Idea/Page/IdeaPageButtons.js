import React from 'react';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import IdeaReportButton from '../Report/IdeaReportButton';
import IdeaEditModal from '../Edit/IdeaEditModal';
import IdeaDeleteModal from '../Delete/IdeaDeleteModal';

const IdeaPageButtons = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    idea: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      showEditModal: false,
      showDeleteModal: false,
    };
  },

  showEditModal() {
    this.toggleEditModal(true);
  },

  toggleEditModal(value) {
    this.setState({ showEditModal: value });
  },

  showDeleteModal() {
    this.toggleDeleteModal(true);
  },

  toggleDeleteModal(value) {
    this.setState({ showDeleteModal: value });
  },

  render() {
    const {
      idea,
      themes,
    } = this.props;

    return (
      <div className="block idea__buttons">
        <ShareButtonDropdown
          id="idea-share-button"
          title={idea.title}
          url={idea._links.show}
        />
        {' '}
        <IdeaReportButton
          idea={idea}
        />
        <div className="pull-right">
          <EditButton
            id="idea-edit-button"
            author={idea.author}
            onClick={this.showEditModal}
            editable={idea.canContribute}
          />
          {' '}
          <DeleteButton
            id="idea-delete-button"
            author={idea.author}
            onClick={this.showDeleteModal}
            deletable={idea.canContribute}
          />
        </div>
        <IdeaEditModal
          idea={idea}
          themes={themes}
          show={this.state.showEditModal}
          onToggleModal={this.toggleEditModal}
        />
        <IdeaDeleteModal
          idea={idea}
          show={this.state.showDeleteModal}
          onToggleModal={this.toggleDeleteModal}
        />
      </div>
    );
  },

});

export default IdeaPageButtons;
