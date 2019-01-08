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
  showModal: boolean,
};

class OpinionSourceAdd extends React.Component<Props, State> {
  state = { showModal: false };

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { dispatch, sourceable } = this.props;
    const { step } = sourceable;
    const { showModal } = this.state;
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
          <RequirementsFormModal step={step} handleClose={this.closeModal} show={showModal} />
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
        requirements {
          viewerMeetsTheRequirements
        }
        ...RequirementsForm_step
        ...RequirementsModal
      }
      ...OpinionSourceFormModal_sourceable
    }
  `,
});
