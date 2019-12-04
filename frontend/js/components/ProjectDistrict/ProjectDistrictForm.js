// @flow
import * as React from 'react';
import { reduxForm } from 'redux-form';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import CreateProjectDistrictMutation from '../../mutations/CreateProjectDistrictMutation';
import UpdateProjectDistrictMutation from '../../mutations/UpdateProjectDistrictMutation';
import CloseButton from '../Form/CloseButton';
import DistrictAdminFields from '../District/DistrictAdminFields';
import type { District, GlobalState } from '../../types';
import { isValid } from '../../services/GeoJsonValidator';

type Props = {
  show: boolean,
  handleClose: () => void,
  member: string,
  isCreating: boolean,
  district: District,
} & ReduxFormFormProps;

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

const onSubmit = (values: FormValues) => {
  const input = {
    name: values.projectDistrict.name,
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

  return CreateProjectDistrictMutation.commit({ input });
};

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
    } = this.props;

    return (
      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="report-modal-title-lg"
        bsSize="large">
        <form onSubmit={this.handleOnSubmit}>
          <Modal.Header closeButton>
            <Modal.Title
              id="report-modal-title-lg"
              children={
                <FormattedMessage
                  id={isCreating ? 'district_modal.create.title' : 'district_modal.update.title'}
                />
              }
            />
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
    return {};
  }

  const { district } = props;

  return {
    initialValues: {
      projectDistrict: {
        ...district,
      },
    },
  };
};

export default connect(mapStateToProps)(form);
