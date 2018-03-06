import React, { PropTypes } from 'react';
import ReplyDeleteModal from '../Delete/ReplyDeleteModal';
import DeleteButton from '../../Form/DeleteButton';

const ReplyModalButtons = React.createClass({
  propTypes: {
    reply: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      showEditModal: false,
      showDeleteModal: false,
    };
  },

  toggleEditModal(value) {
    this.setState({ showEditModal: value });
  },

  toggleDeleteModal(value) {
    this.setState({ showDeleteModal: value });
  },

  render() {
    const { reply, form, onChange } = this.props;
    return (
      <span className="pull-left reply__buttons">
        {form.contribuable && (
          <DeleteButton
            id={`reply-delete-button${reply.id}`}
            className="reply__delete-btn"
            author={reply.author}
            onClick={this.toggleDeleteModal.bind(null, true)}
            style={{ marginLeft: '15px' }}
            deletable={form.isContribuable}
          />
        )}
        {form.contribuable && (
          <div>
            <ReplyDeleteModal
              reply={reply}
              form={form}
              show={this.state.showDeleteModal}
              onToggleModal={this.toggleDeleteModal}
              onDelete={onChange}
            />
          </div>
        )}
      </span>
    );
  },
});

export default ReplyModalButtons;
