import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import ArgumentVoteBox from './Vote/ArgumentVoteBox';
import ArgumentEditModal from './Edition/ArgumentEditModal';
import ArgumentDeleteModal from './Deletion/ArgumentDeleteModal';
import ArgumentReportButton from './ArgumentReportButton';
import EditButton from '../Form/EditButton';
import DeleteButton from '../Form/DeleteButton';

const ArgumentButtons = React.createClass({
  propTypes: {
    argument: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isEditing: false,
      isDeleting: false,
    };
  },

  openEditModal() {
    this.setState({ isEditing: true });
  },

  closeEditModal() {
    this.setState({ isEditing: false });
  },

  openDeleteModal() {
    this.setState({ isDeleting: true });
  },

  closeDeleteModal() {
    this.setState({ isDeleting: false });
  },

  render() {
    const { argument } = this.props;
    return (
    <div>
      <ArgumentVoteBox
        argument={argument}
      />
      { ' ' }
      <ArgumentReportButton
        argument={argument}
      />
      {' '}
      <EditButton
        onClick={this.openEditModal}
        author={argument.author}
        editable={argument.isContribuable}
        className="argument__btn--edit btn-xs btn-dark-gray btn--outline"
      />
      <ArgumentEditModal
        argument={argument}
        show={this.state.isEditing}
        onClose={this.closeEditModal}
      />
      {' '}
      <DeleteButton
        onClick={this.openDeleteModal}
        author={argument.author}
        className="argument__btn--delete btn-xs"
      />
      <ArgumentDeleteModal
        argument={argument}
        show={this.state.isDeleting}
        onClose={this.closeDeleteModal}
      />
      {' '}
      <ShareButtonDropdown
        id={`arg-${argument.id}-share-button`}
        url={argument._links.show}
        className="argument__btn--share btn-dark-gray btn--outline btn btn-xs"
      />
    </div>
    );
  },

});

export default ArgumentButtons;
