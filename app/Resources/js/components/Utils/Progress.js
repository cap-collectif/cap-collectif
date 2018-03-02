// @flow
import * as React from 'react';
import { injectGlobal } from 'styled-components';
import { ProgressBar } from 'react-bootstrap';

type Props = {
  now: number,
  label?: ?text,
  className?: ?text,
  bsStyle?: ?text,
};

export class Progress extends React.Component<Props> {
  static defaultProps = {
    now: 100, // number between 0 & 100
    label: 'À venir', // Terminé, participation en continue, en cours, check for trad
    className: 'progress-bar__grey', // progress-bar__empty
    bsStyle: null, // success or nothing
  };

  componentWillMount() {
    this.globals = injectGlobal`
    .progress {
      margin-bottom: 15px;
      background-color: #F6F6F6;
    }

    .progress-bar__grey .progress-bar {
      background-color: #707070;
    }

    .progress-bar__empty .progress-bar {
       background-color: #F6F6F6;
       color: #707070;
       box-shadow: inset 0 1px 2px rgba(33, 37, 41, 0.1);
    }
  `
  }; // to remove if we have css

  render() {
    const { now, label, className, bsStyle } = this.props;

    return (
      <ProgressBar
        bsStyle={bsStyle}
        now={now}
        label={label}
        className={className}
      />
    );
  }
}

export default Progress;
