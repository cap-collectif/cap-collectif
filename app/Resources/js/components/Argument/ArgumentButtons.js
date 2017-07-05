// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import ArgumentVoteBox from './Vote/ArgumentVoteBox';
import ArgumentEditModal from './Edition/ArgumentEditModal';
import ArgumentDeleteModal from './Deletion/ArgumentDeleteModal';
import ArgumentReportButton from './ArgumentReportButton';
import EditButton from '../Form/EditButton';
import DeleteButton from '../Form/DeleteButton';
import { openArgumentEditModal } from '../../redux/modules/opinion';

const ArgumentButtons = React.createClass({
  propTypes: {
    argument: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

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
    const { argument, dispatch } = this.props;
    return (
      <div>
        <ArgumentVoteBox argument={argument} />{' '}
        <ArgumentReportButton argument={argument} />{' '}
        <EditButton
          onClick={() => {
            dispatch(openArgumentEditModal(argument.id));
          }}
          author={argument.author}
          editable={argument.isContribuable}
          className="argument__btn--edit btn-xs btn-dark-gray btn--outline"
        />
        <ArgumentEditModal argument={argument} />{' '}
        <DeleteButton
          onClick={this.openDeleteModal}
          author={argument.author}
          className="argument__btn--delete btn-xs"
        />
        <ArgumentDeleteModal
          argument={argument}
          show={this.state.isDeleting}
          onClose={this.closeDeleteModal}
        />{' '}
        <ShareButtonDropdown
          id={`arg-${argument.id}-share-button`}
          url={argument._links.show}
          className="argument__btn--share btn-dark-gray btn--outline btn btn-xs"
        />
      </div>
    );
  },
});

export default connect()(ArgumentButtons);
