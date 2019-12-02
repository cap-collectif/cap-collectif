// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field, change } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';
import type { ProposalFormAdminCategoriesStepModal_query } from '~relay/ProposalFormAdminCategoriesStepModal_query.graphql';
import type { Dispatch, FeatureToggles, GlobalState } from '~/types';

type RelayProps = {| query: ProposalFormAdminCategoriesStepModal_query |};

type Props = {|
  ...RelayProps,
  show: boolean,
  onClose: () => {},
  onSubmit: () => {},
  member: string,
  isUpdating: boolean,
  dispatch: Dispatch,
  formName: string,
  category: {
    categoryImage: ?Object,
  },
  features: FeatureToggles,
|};

type State = {|
  showPredefinedImage: boolean,
|};

export class ProposalFormAdminCategoriesStepModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showPredefinedImage: !!props.category.categoryImage || !props.isUpdating,
    };
  }

  render() {
    const {
      dispatch,
      member,
      show,
      isUpdating,
      onClose,
      onSubmit,
      query,
      formName,
      features,
      category,
    } = this.props;

    const { showPredefinedImage } = this.state;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={
              <FormattedMessage
                id={!isUpdating ? 'category_modal.create.title' : 'category_modal.update.title'}
              />
            }
          />
        </Modal.Header>
        <Modal.Body>
          <Field
            label={<FormattedMessage id='global.title' />}
            id={`${member}.name`}
            name={`${member}.name`}
            type="text"
            component={component}
          />
          {features.display_pictures_in_depository_proposals_list && (
            <div>
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
                    dispatch(change(formName, `${member}.customCategoryImage`, null));
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
                  <FormattedMessage id='global.custom.feminine' />
                </Button>
              </div>
              <Field
                id={`${member}.newCategoryImage`}
                name={`${member}.newCategoryImage`}
                component={component}
                type="image"
                className={showPredefinedImage ? 'hide' : ''}
                onChange={() => {
                  dispatch(change(formName, `${member}.customCategoryImage`, null));
                }}
                label={
                  <span>
                    <FormattedMessage id="illustration" />
                    <span className="excerpt">
                      {' '}
                      <FormattedMessage id="global.optional" />
                    </span>
                  </span>
                }
                help={
                  <span className={showPredefinedImage ? 'hide' : 'excerpt'}>
                    <FormattedMessage id="authorized-files" />{' '}
                    <FormattedMessage id="max-weight-1mo" />
                    <p>
                      <FormattedMessage id="recommanded-dimensions-186x60" />
                    </p>
                  </span>
                }
                disabled={showPredefinedImage}
              />
              {!showPredefinedImage &&
                query.customCategoryImages &&
                query.customCategoryImages.length > 0 && (
                  <p className="text-bold">
                    <FormattedMessage id="your-pictures" />
                  </p>
                )}
              <Field
                id={`${member}.customCategoryImage`}
                name={`${member}.customCategoryImage`}
                type="radio-images"
                className={showPredefinedImage ? 'hide' : null}
                component={component}
                medias={query.customCategoryImages}
                disabled={showPredefinedImage}
                onChange={() => {
                  dispatch(change(formName, `${member}.newCategoryImage`, null));
                }}
              />
              <Field
                id={`${member}.categoryImage`}
                name={`${member}.categoryImage`}
                type="radio-images"
                className={!showPredefinedImage ? 'hide' : null}
                component={component}
                medias={query.categoryImages}
                disabled={!showPredefinedImage}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              onClose();
              this.setState({
                showPredefinedImage: !isUpdating && !!category.categoryImage,
              });
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

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

const container = connect(mapStateToProps)(ProposalFormAdminCategoriesStepModal);

export default createFragmentContainer(container, {
  query: graphql`
    fragment ProposalFormAdminCategoriesStepModal_query on Query {
      categoryImages(isDefault: true) {
        id
        image {
          url
          id
          name
        }
      }
      customCategoryImages: categoryImages(isDefault: false) {
        id
        image {
          url
          id
          name
        }
      }
    }
  `,
});
