// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';
import type { ProposalFormAdminCategoriesStepModal_categoryImages } from '~relay/ProposalFormAdminCategoriesStepModal_categoryImages.graphql';
import type { Dispatch } from '~/types';

type RelayProps = {| categoryImages: ProposalFormAdminCategoriesStepModal_categoryImages |};

type Props = {|
  ...RelayProps,
  show: boolean,
  onClose: () => {},
  onSubmit: () => {},
  member: string,
  isCreating: boolean,
  newCategoryImage: ?{
    id: string,
    name: string,
    url: string,
  },
  categoryImage: ?{
    id: string,
    image: {
      id: string,
      name: string,
      url: string,
    },
  },
  dispatch: Dispatch,
  formName: string,
|};

type State = {|
  showPredefinedImage: boolean,
|};

export class ProposalFormAdminCategoriesStepModal extends React.Component<Props, State> {
  state = {
    showPredefinedImage: true,
  };

  render() {
    const {
      dispatch,
      member,
      show,
      isCreating,
      onClose,
      onSubmit,
      categoryImages,
      newCategoryImage,
      categoryImage,
      formName,
    } = this.props;

    const { showPredefinedImage } = this.state;

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
          <div id="step-view-toggle" className="btn-group d-flex mb-15 w-100" role="group">
            <Button
              bsStyle="default"
              active={showPredefinedImage}
              role="checkbox"
              aria-checked={showPredefinedImage}
              style={{ flex: '1 0 auto' }}
              onClick={() => {
                this.setState({ showPredefinedImage: true });
                dispatch(change(formName, `${member}.newCategoryImage`, null));
              }}>
              <FormattedMessage id="preset-picture" />
            </Button>
            <Button
              bsStyle="default"
              active={!showPredefinedImage}
              role="checkbox"
              aria-checked={!showPredefinedImage}
              style={{ flex: '1 0 auto' }}
              onClick={() => {
                this.setState({ showPredefinedImage: false });
                dispatch(change(formName, `${member}.categoryImage`, null));
              }}>
              <FormattedMessage id="custom-picture" />
            </Button>
          </div>
          <Field
            id={`${member}.newCategoryImage`}
            name={`${member}.newCategoryImage`}
            component={component}
            type="image"
            className={!!categoryImage ? 'hide' : ''}
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
              <span className={showPredefinedImage ? 'hide' : 'excerpt'}>
                <FormattedMessage id="authorized-files" /> <FormattedMessage id="max-weight-1mo" />
              </span>
            }
            disabled={showPredefinedImage}
          />
          <p
            className={
              !!newCategoryImage || !!categoryImages ? 'hide' : 'excerpt'
            }>
            <FormattedMessage id="or-pick-image-in-list" />
          </p>
          <Field
            id={`${member}.categoryImage`}
            name={`${member}.categoryImage`}
            type="radio-images"
            className={!showPredefinedImage ? 'hide' : null}
            component={component}
            medias={categoryImages}
            disabled={!showPredefinedImage}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              onClose();
              this.setState({ showPredefinedImage: true });
            }}
          />
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

const selector = formValueSelector('proposal-form-admin-configuration');

const mapStateToProps = (state: State, props: Props) => ({
  newCategoryImage: selector(state, `${props.member}.newCategoryImage`),
  categoryImage: selector(state, `${props.member}.categoryImage`),
});

const container = connect(mapStateToProps)(ProposalFormAdminCategoriesStepModal);

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
