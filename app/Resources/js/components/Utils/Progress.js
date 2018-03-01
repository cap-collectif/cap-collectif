// @flow
import * as React from 'react';
import styled, { injectGlobal } from 'styled-components';
import { ProgressBar } from 'react-bootstrap';

type Props = {
  contentWidth: number,
  label?: text,
  className?: text,
  bsStyle?: text,
};

componentWillMount = () => {
  this.globals = injectGlobal` 
    body {
      font-family: sans-serif;
    } 
  `
};

// add style of class on css

// const Bar = styled.ProgressBar`
//   &.grey_progress-bar {
//     background-color: #707070;
//   }
//
//   &.empty_progress-bar {
//     background-color: #F6F6F6;
//     color: #707070;
//     box-shadow: inset 0 1px 2px rgba(33, 37, 41, 0.1);
//   }
// `;

export class Progress extends React.Component<Props> {
  static defaultProps = {
    contentWidth: 100, // number between 0 & 100
    label: 'à venir', // Terminé, participation en continue, en cours
    className: 'progress-bar__grey', // progress-bar__empty
    bsStyle: 'success', // or nothing
  };

  render() {
    const { contentWidth, label, className, bsStyle } = this.props;

    return (
      <ProgressBar
        bsStyle={bsStyle}
        now={contentWidth}
        label={label}
        className={className}
      />
    );
  }
}

export default Progress;
