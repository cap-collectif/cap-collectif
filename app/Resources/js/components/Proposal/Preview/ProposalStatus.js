import React, { PropTypes } from 'react';
import classNames from 'classnames';
import CardStatus from "../../Ui/Card/CardStatus";

const ProposalStatus = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    stepId: PropTypes.string,
  },

  getDefaultProps() {
    return {
      stepId: null,
    };
  },

  getStatus() {
    const { proposal, stepId } = this.props;
    if (stepId) {
      const selection = proposal.selections.filter(sel => {
        return sel.step.id === stepId;
      });
      if (selection.length > 0) {
        return selection[0].status;
      }
    }
    return proposal.status;
  },

  render() {
    const status = this.getStatus();
    const statusClasses = {};
    if (status) {
      statusClasses[`status--${status.color}`] = true;
    }

    return (
      <CardStatus className={classNames(statusClasses)}>
          {status && status.name}
      </CardStatus>
    );
  },
});

export default ProposalStatus;
