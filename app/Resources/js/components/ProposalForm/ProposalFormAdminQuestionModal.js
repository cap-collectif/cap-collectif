// @flow
import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';

const selector = formValueSelector('proposal-form-admin-configuration');

export const ProposalFormAdminQuestionModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    member: PropTypes.string.isRequired,
    isCreating: PropTypes.bool.isRequired,
    kind: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  componentWillUpdate(nextProps) {
    const { kind, dispatch, member } = this.props;
    if (nextProps.kind === 'media' && nextProps.kind !== kind) {
      dispatch(change('proposal-form-admin-configuration', `${member}.type`, 'medias'));
    }
  },

  render() {
    const { member, show, isCreating, onClose, onSubmit, kind } = this.props;
    return (
      <Modal
        show={show}
        onHide={onClose}
        aria-labelledby="proposal-form-admin-question-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="proposal-form-admin-question-modal-title-lg"
            children={
              <FormattedMessage id={!isCreating ? 'Créer une question' : 'Modifier la question'} />
            }
          />
        </Modal.Header>
        <Modal.Body>
          <Field
            label="Titre"
            id={`${member}.title`}
            name={`${member}.title`}
            type="text"
            component={component}
          />
          <Field
            label="Texte d'aide"
            id={`${member}.helpText`}
            name={`${member}.helpText`}
            type="text"
            component={component}
          />
          <Field
            label="Type de réponse"
            id={`${member}.kind`}
            name={`${member}.kind`}
            type="select"
            component={component}
            disabled={isCreating}>
            <option value="" disabled>
              Sélectionner un type
            </option>
            <option value="simple">Texte Libre</option>
            <option value="media">
              <FormattedMessage id="global.question.types.medias" />
            </option>
          </Field>
          <Field
            label="Format de réponse"
            id={`${member}.type`}
            name={`${member}.type`}
            type="select"
            style={{ display: kind === 'simple' ? 'inline' : 'none' }}
            component={component}
            disabled={isCreating}
            normalize={value => {
              return kind === 'medias' ? 'media' : value;
            }}>
            <option value="" disabled selected={kind === 'simple'}>
              <FormattedMessage id="global.select" />
            </option>
            <option value="text">
              <FormattedMessage id="global.question.types.text" />
            </option>
            <option value="textarea">
              <FormattedMessage id="global.question.types.textarea" />
            </option>
            <option value="editor">
              <FormattedMessage id="global.question.types.editor" />
            </option>
          </Field>
          <Field
            id={`${member}.required`}
            name={`${member}.required`}
            type="checkbox"
            normalize={val => !!val}
            children={<FormattedMessage id="global.admin.required" />}
            component={component}
          />
          <Field
            children="Visible uniquement par l'utilisateur et l'administrateur"
            id={`${member}.private`}
            normalize={val => !!val}
            name={`${member}.private`}
            type="checkbox"
            component={component}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onSubmit} />
        </Modal.Footer>
      </Modal>
    );
  },
});

const mapStateToProps = (state, props) => ({
  kind: selector(state, `${props.member}.kind`) || '',
});

export default connect(mapStateToProps)(ProposalFormAdminQuestionModal);
