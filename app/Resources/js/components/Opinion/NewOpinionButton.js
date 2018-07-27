// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../Utils/LoginOverlay';
import OpinionCreateModal from './Create/OpinionCreateModal';
import { openOpinionCreateModal } from '../../redux/modules/opinion';

type Props = {
  opinionType: Object,
  stepId: string,
  projectId: string,
  label: string,
  disabled?: boolean,
  dispatch: Function,
};

class NewOpinionButton extends React.Component<Props> {
  render() {
    const { dispatch, label, opinionType, projectId, stepId, disabled } = this.props;
    return (
      <span>
        <LoginOverlay>
          <Button
            bsStyle="primary"
            disabled={disabled}
            id={`btn-add--${opinionType.slug}`}
            onClick={() => {
              dispatch(openOpinionCreateModal(opinionType.id));
            }}>
            <i className="cap cap-add-1" />
            <span className="hidden-xs">{label}</span>
          </Button>
        </LoginOverlay>
        <OpinionCreateModal opinionType={opinionType} stepId={stepId} projectId={projectId} />
      </span>
    );
  }
}

export default connect()(NewOpinionButton);
