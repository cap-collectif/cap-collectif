// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import IdeaCreateButton from './IdeaCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import IdeaCreateForm, { formName } from './IdeaCreateForm';
import {
  showIdeaCreateModal,
  hideIdeaCreateModal,
} from '../../../redux/modules/idea';
import type { State } from '../../../types';

export const IdeaCreate = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
    themeId: PropTypes.number,
    className: PropTypes.string,
    show: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      themeId: -1,
    };
  },

  render() {
    const {
      className,
      themeId,
      themes,
      dispatch,
      submitting,
      show,
    } = this.props;
    return (
      <div className={className}>
        <IdeaCreateButton
          handleClick={() => {
            dispatch(showIdeaCreateModal());
          }}
        />
        <Modal
          animation={false}
          show={show}
          onHide={() => {
            dispatch(hideIdeaCreateModal());
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {this.getIntlMessage('idea.add')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <IdeaCreateForm themes={themes} themeId={themeId} />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                dispatch(hideIdeaCreateModal());
              }}
            />
            <SubmitButton
              id="confirm-idea-create"
              isSubmitting={submitting}
              onSubmit={() => {
                dispatch(submit(formName));
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
});

export default connect((state: State) => ({
  show: state.idea.showCreateModal,
  submitting: isSubmitting(formName)(state),
}))(IdeaCreate);
