// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../Utils/LoginOverlay';
import OpinionCreateModal from './Create/OpinionCreateModal';
import { openOpinionCreateModal } from '../../redux/modules/opinion';

const NewOpinionButton = React.createClass({
  propTypes: {
    opinionTypeSlug: PropTypes.string.isRequired,
    opinionTypeId: PropTypes.string.isRequired,
    stepId: PropTypes.number.isRequired,
    projectId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      dispatch,
      label,
      opinionTypeSlug,
      opinionTypeId,
      projectId,
      stepId,
      disabled,
    } = this.props;
    return (
      <span>
        <LoginOverlay>
          <Button
            bsStyle="primary"
            disabled={disabled}
            id={`btn-add--${opinionTypeSlug}`}
            onClick={() => {
              dispatch(openOpinionCreateModal(opinionTypeId));
            }}>
            <i className="cap cap-add-1" />
            <span className="hidden-xs">{label}</span>
          </Button>
        </LoginOverlay>
        <OpinionCreateModal
          opinionTypeId={opinionTypeId}
          stepId={stepId}
          projectId={projectId}
        />
      </span>
    );
  },
});

export default connect()(NewOpinionButton);
