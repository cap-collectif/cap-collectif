// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
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
    disabled: PropTypes.boolean,
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
          <a
            id={`btn-add--${opinionTypeSlug}`}
            onClick={() => {
              dispatch(openOpinionCreateModal(opinionTypeId));
            }}
            className={`btn btn-primary${disabled ? ' disabled' : ''}`}>
            <i className="cap cap-add-1" />
            <span className="hidden-xs">{label}</span>
          </a>
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
