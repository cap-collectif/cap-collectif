// @flow
import * as React from 'react';
import { reduxForm, type FormProps } from 'redux-form';
import { Modal, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import CreateProjectDistrictMutation from '../../mutations/CreateProjectDistrictMutation';
import UpdateProjectDistrictMutation from '../../mutations/UpdateProjectDistrictMutation';
import CloseButton from '../Form/CloseButton';
import DistrictAdminFields from '../District/DistrictAdminFields';
import type { GlobalState } from '../../types';

type Props = {
  show: boolean,
  handleClose: () => void,
  member: string,
  isCreating: boolean,
  district: Object,
} & FormProps;

type FormValues = {
  projectDistrict: Object,
};

const validate = (values: FormValues) => {
  const errors = {
    projectDistrict: {},
  };

  if (!values.projectDistrict || !values.projectDistrict.name) {
    errors.projectDistrict.name = 'global.admin.required';
  }

  const borderEnable =
    values.projectDistrict &&
    values.projectDistrict.border &&
    values.projectDistrict.border.enabled;

  if (borderEnable) {
    errors.projectDistrict.border = {};
  }

  if (borderEnable && !values.projectDistrict.border.size) {
    errors.projectDistrict.border.size = 'global.admin.required';
  }

  if (borderEnable && !values.projectDistrict.border.opacity) {
    errors.projectDistrict.border.opacity = 'global.admin.required';
  }
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

  if (backgroundEnable && !values.projectDistrict.background.opacity) {
    errors.projectDistrict.background.opacity = 'global.admin.required';
  }
  if (backgroundEnable && !values.projectDistrict.background.color) {
    errors.projectDistrict.background.color = 'global.admin.required';
  }

  return errors;
};

const onSubmit = (values: FormValues) => {
  // Clean the __typename field automatically added with @connection
  delete values.projectDistrict.__typename;

  const input = {
    ...values.projectDistrict,
  };

  if (Object.prototype.hasOwnProperty.call(values.projectDistrict, 'id')) {
    return UpdateProjectDistrictMutation.commit({ input });
  }

  return CreateProjectDistrictMutation.commit({ input });
};

export class ProjectDistrictForm extends React.Component<Props> {
  handleOnSubmit = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const { handleSubmit, handleClose } = this.props;

    // $FlowFixMe
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
            {/* $FlowFixMe */}
            <DistrictAdminFields member={member} district={district} />
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => {
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
