// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';
import type { ProposalFormAdminCategoriesStepModal_categoryImages } from '~relay/ProposalFormAdminCategoriesStepModal_categoryImages.graphql';

type RelayProps = {| categoryImages: ProposalFormAdminCategoriesStepModal_categoryImages |};

type Props = {|
  ...RelayProps,
  show: boolean,
  onClose: () => {},
  onSubmit: () => {},
  member: string,
  isCreating: boolean,
|};

export class ProposalFormAdminCategoriesStepModal extends React.Component<Props> {
  render() {
    const { member, show, isCreating, onClose, onSubmit, categoryImages } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={
              <FormattedMessage
                id={!isCreating ? 'category_modal.create.title' : 'category_modal.update.title'}
              />
            }
          />
        </Modal.Header>
        <Modal.Body>
          <Field
            label={<FormattedMessage id="admin.fields.group.title" />}
            id={`${member}.name`}
            name={`${member}.name`}
            type="text"
            component={component}
          />
          <Field
            id={`${member}.media`}
            name={`${member}.media`}
            component={component}
            type="image"
            label={
              <span>
                <FormattedMessage id="illustration" />
                <span className="excerpt">
                  {' '}
                  <FormattedMessage id="global.form.optional" />
                </span>
              </span>
            }
            help={
              <span className="excerpt">
                <FormattedMessage id="authorized-files" /> <FormattedMessage id="max-weight-1mo" />
              </span>
            }
          />
          <p className="excerpt">
            <FormattedMessage id="or-pick-image-in-list" />
          </p>
          <Field
            id={`${member}.mediaList`}
            name={`${member}.mediaList`}
            type="radio-images"
            component={component}
            medias={categoryImages}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="ProposalFormAdminCategoriesStepModal-submit"
            label="global.validate"
            isSubmitting={false}
            onSubmit={onSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const container = connect()(ProposalFormAdminCategoriesStepModal);

export default createFragmentContainer(container, {
  categoryImages: graphql`
    fragment ProposalFormAdminCategoriesStepModal_categoryImages on CategoryImage
      @relay(plural: true) {
      id
      image {
        url
        id
        name
      }
    }
  `,
});
