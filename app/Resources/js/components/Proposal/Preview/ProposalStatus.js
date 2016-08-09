import React, { PropTypes } from 'react';
import classNames from 'classnames';

const ProposalStatus = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStepId: PropTypes.number,
  },

  getDefaultProps() {
    return {
      selectionStepId: null,
    };
  },

  getStatus() {
    const { proposal, selectionStepId } = this.props;
    if (selectionStepId) {
      const selection = proposal.selections.filter((sel) => {
        return sel.step.id === selectionStepId;
      });
      if (selection.length > 0) {
        return selection[0].status;
      }
    }
    return proposal.status;
  },

  render() {
    const status = this.getStatus();
    const statusClasses = {
      proposal__status: true,
    };
    if (status) {
      statusClasses[`status--${status.color}`] = true;
    }

    return (
      <div className={classNames(statusClasses)}>
        {
          status && status.name
        }
      </div>
    );
  },

});

export default ProposalStatus;
