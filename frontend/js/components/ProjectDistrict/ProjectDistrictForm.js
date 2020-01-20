// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { isValid } from '~/services/GeoJsonValidator';
import CloseButton from '~/components/Form/CloseButton';
import DistrictAdminFields from '~/components/District/DistrictAdminFields';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';
import { getTranslation, handleTranslationChange } from '~/services/Translation';
import type { District, FeatureToggles, GlobalState } from '~/types';
import CreateProjectDistrictMutation from '~/mutations/CreateProjectDistrictMutation';
import UpdateProjectDistrictMutation from '~/mutations/UpdateProjectDistrictMutation';
import type { ProjectDistrictForm_district } from '~relay/ProjectDistrictForm_district.graphql';

type Props = {
  show: boolean,
  member: string,
  isCreating: boolean,
  handleClose: () => void,
  defaultLanguage: string,
  district: ProjectDistrictForm_district,
  features: FeatureToggles,
  ...ReduxFormFormProps,
};

type FormValues = {
  projectDistrict: District,
};

const validate = (values: FormValues) => {
  const errors = {
    projectDistrict: {},
  };

  if (!values.projectDistrict || !values.projectDistrict.name) {
    errors.projectDistrict.name = 'global.admin.required';
  }

  if (
    values.projectDistrict &&
    values.projectDistrict.geojson &&
    !isValid(values.projectDistrict.geojson)
  ) {
    errors.projectDistrict.geojson = 'admin.fields.proposal.map.zone.geojson.invalid';
  }

  const borderEnable =
    values.projectDistrict &&
    values.projectDistrict.border &&
    values.projectDistrict.border.enabled;

  if (borderEnable) {
    errors.projectDistrict.border = {};
  }

  // $FlowFixMe
  if (borderEnable && !values.projectDistrict.border.size) {
    errors.projectDistrict.border.size = 'global.admin.required';
  }

  // $FlowFixMe
  if (borderEnable && !values.projectDistrict.border.opacity) {
    errors.projectDistrict.border.opacity = 'global.admin.required';
  }

  // $FlowFixMe
  if (borderEnable && !values.projectDistrict.border.color) {
    errors.projectDistrict.border.color = 'global.admin.required';
  }

  const backgroundEnable =
    values.projectDistrict &&
    values.projectDistrict.background &&
    values.projectDistrict.background.enabled;

  if (backgroundEnable) {
    errors.projectDistrict.background = {};
  }

  // $FlowFixMe
  if (backgroundEnable && !values.projectDistrict.background.opacity) {
    errors.projectDistrict.background.opacity = 'global.admin.required';
  }

  // $FlowFixMe
  if (backgroundEnable && !values.projectDistrict.background.color) {
    errors.projectDistrict.background.color = 'global.admin.required';
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const translation = {
    name: values.projectDistrict.name,
    locale: props.defaultLanguage,
  };

  const input = {
    translations: handleTranslationChange(
      props.district ? props.district.translations : [],
      translation,
      props.defaultLanguage,
    ),
    geojson: values.projectDistrict.geojson,
    displayedOnMap: values.projectDistrict.displayedOnMap,
    border: {
      enabled: values.projectDistrict.border ? values.projectDistrict.border.enabled : null,
      color: values.projectDistrict.border ? values.projectDistrict.border.color : null,
      opacity: values.projectDistrict.border ? values.projectDistrict.border.opacity : null,
      size: values.projectDistrict.border ? values.projectDistrict.border.size : null,
    },
    background: {
      enabled: values.projectDistrict.background ? values.projectDistrict.background.enabled : null,
      color: values.projectDistrict.background ? values.projectDistrict.background.color : null,
      opacity: values.projectDistrict.background ? values.projectDistrict.background.opacity : null,
    },
  };

  if (Object.prototype.hasOwnProperty.call(values.projectDistrict, 'id')) {
    return UpdateProjectDistrictMutation.commit({
      input: { ...input, id: values.projectDistrict.id },
    });
  }

  return CreateProjectDistrictMutation.commit({ input }, props.defaultLanguage);
};

const ModalHeaderContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
`;

export class ProjectDistrictForm extends React.Component<Props> {
  handleOnSubmit = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const { handleSubmit, handleClose } = this.props;

    handleSubmit();
    handleClose();
  };

  render() {
    const {
      member,
      show,
      isCreating,
      handleClose,
      pristine,
      submitting,
      district,
      invalid,
      features,
    } = this.props;

    return (
      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="report-modal-title-lg"
        bsSize="large">
        <form onSubmit={this.handleOnSubmit}>
          <Modal.Header closeButton>
            <ModalHeaderContainer>
              <Modal.Title
                id="report-modal-title-lg"
                children={
                  <FormattedMessage
                    id={isCreating ? 'district_modal.create.title' : 'district_modal.update.title'}
                  />
                }
              />
              <span className="mr-5">
                {features.unstable__multilangue && <LanguageButtonContainer />}
              </span>
            </ModalHeaderContainer>
          </Modal.Header>
          <Modal.Body>
            <DistrictAdminFields member={member} district={district} enableDesignFields={false} />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={handleClose} />
            <Button
              type="submit"
              id="js-sumbit-button"
              bsStyle="primary"
              disabled={pristine || invalid || submitting}>
              <FormattedMessage id={submitting ? 'global.loading' : 'global.validate'} />
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: 'projectDistrictForm',
})(ProjectDistrictForm);

const mapStateToProps = (state: GlobalState, props: Props) => {
  if (!props.district) {
    return {
      defaultLanguage: state.language.currentLanguage,
      features: state.default.features,
    };
  }

  const { district } = props;
  const translation = getTranslation(district.translations, state.language.currentLanguage);
  return {
    defaultLanguage: state.language.currentLanguage,
    initialValues: {
      projectDistrict: {
        ...district,
        name: translation ? translation.name : null,
      },
    },
    features: state.default.features,
  };
};

export const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  district: graphql`
    fragment ProjectDistrictForm_district on ProjectDistrict {
      ...DistrictAdminFields_district
      id
      name
      geojson
      displayedOnMap
      border {
        enabled
        color
        opacity
        size
      }
      background {
        enabled
        color
        opacity
      }
      translations {
        name
        locale
      }
    }
  `,
});
