/* @flow */
import * as React from 'react';

import * as S from './styles';

type Props = {
  onClick: () => void,
  expanded: boolean,
};

export class NavbarToggle extends React.Component<Props> {
  render() {
    const { onClick, expanded } = this.props;
    return (
      <S.Toggle id="main-navbar-toggle" type="button" aria-expanded={expanded} onClick={onClick}>
        <span className="sr-only">Toggle navigation</span>
        <S.Bar />
        <S.Bar />
        <S.Bar />
      </S.Toggle>
    );
  }
}

export default NavbarToggle;
