import * as React from 'react';
import moment from 'moment';

type Props = {
  phases: Array<Object>,
};

export class ImplementationPhaseTitle extends React.Component<Props> {
  getPhaseTitle = (phases: Array<Object>): string => {
    const openPhase = phases.filter(e => moment().isBetween(e.startAt, e.endAt));
    const toComePhase = phases.filter(e => moment().isBefore(e.startAt));
    const endPhase = phases[phases.length - 1];

    if (openPhase.length > 0) {
      return openPhase[0].title;
    }

    if (toComePhase.length > 0) {
      return toComePhase[0].title;
    }

    if (endPhase) {
      return endPhase.title;
    }
  };

  render() {
    const { phases } = this.props;

    if (phases) {
      return this.getPhaseTitle(phases);
    }

    return null;
  }
}

export default ImplementationPhaseTitle;
