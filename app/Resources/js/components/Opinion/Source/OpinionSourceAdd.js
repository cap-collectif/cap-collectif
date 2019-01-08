// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionSourceAddButton from './OpinionSourceAddButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';
import { showSourceCreateModal } from '../../../redux/modules/opinion';
import type { OpinionSourceAdd_sourceable } from './__generated__/OpinionSourceAdd_sourceable.graphql';
import RequirementsFormModal from '../../Requirements/RequirementsModal';

type Props = {
  dispatch: Function,
  sourceable: OpinionSourceAdd_sourceable,
};

type State = {
  openModal: boolean,
};

class OpinionSourceAdd extends React.Component<Props, State> {
  state = { openModal: false };

  openModal = () => {
    this.setState({ openModal: true });
  };

  closeModal = () => {
    this.setState({ openModal: false });
  };

  render() {
    const { dispatch, sourceable } = this.props;
    const { step } = sourceable;
    const { openModal } = this.state;
    const disabled = !sourceable.contribuable;
    return (
      <div>
        <OpinionSourceAddButton
          disabled={disabled}
          handleClick={() => {
            if (step && step.requirements && !step.requirements.viewerMeetsTheRequirements) {
              this.openModal();
              return;
            }
            dispatch(showSourceCreateModal());
          }}
        />
        {step /* $FlowFixMe */ && (
          <RequirementsFormModal
            step={step}
            reason={step.requirements.reason}
            handleClose={this.closeModal}
            show={openModal}
          />
        )}
        {!disabled && <OpinionSourceFormModal sourceable={sourceable} source={null} />}
      </div>
    );
  }
}

const container = connect()(OpinionSourceAdd);
export default createFragmentContainer(container, {
  sourceable: graphql`
    fragment OpinionSourceAdd_sourceable on Sourceable {
      id
      contribuable
      step {
        ...RequirementsForm_step
        id
        requirements {
          viewerMeetsTheRequirements
          reason
        }
      }
      ...OpinionSourceFormModal_sourceable
    }
  `,
});
