// // @flow
import styled, { type StyledComponent } from 'styled-components';
import * as React from 'react';
import colors from '../../../utils/colors';

type Props = {
  children: ?React.Node,
};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'stacked-nav',
})`
  background-color: ${colors.pageBgc};
  width: 100%;

  a,
  a:hover,
  button,
  button:hover {
    text-decoration: none;
  }

  .stacked-nav__header {
    color: ${colors.darkGray};
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid ${colors.borderColor};
    text-transform: uppercase;
    padding-bottom: 10px;

    .btn-link {
      color: ${colors.darkGray};
    }

    p {
      margin: 0;
    }

    .cap-android-menu {
      font-size: 21px;
      top: 5px;
    }

    .cap-delete-1 {
      font-size: 12px;
    }
  }

  .stacked-nav__list {
    .btn-link.active,
    .btn-link:hover {
      background-color: ${colors.white};
      border: 1px solid ${colors.borderColor};
    }

    .btn-link {
      color: ${colors.black};
      border: 1px solid ${colors.pageBgc};
      font-size: 16px;
      width: 100%;
      text-align: left;
      padding: 10px 15px;
    }

    .level--0 {
      font-weight: 600;
    }

    .level--1 {
      padding-left: 35px;
      font-weight: 500;
    }

    .level--2 {
      padding-left: 55px;
      font-weight: 400;
    }

    .level--3 {
      padding-left: 75px;
      font-weight: 300;
    }
  }

  .stacked-nav__footer {
    padding: 15px 0;
    color: ${colors.black};

    .btn-link {
      font-weight: 300;
      font-size: 16px;

      &:not(:hover) {
        color: ${colors.black};
      }
    }
  }

  @media (max-width: 991px) {
    background-color: ${colors.white};

    .stacked-nav__header {
      padding: 5px 15px 10px;
      color: ${colors.white};
      text-transform: capitalize;

      .btn-link,
      .btn-link:hover {
        color: ${colors.white};
      }
    }

    .stacked-nav__list .btn-link {
      border: 1px solid ${colors.white};

      &.active,
      &:hover {
        background-color: ${colors.pageBgc};
        border: 1px solid ${colors.pageBgc};
      }
    }

    .stacked-nav__footer {
      padding: 15px 15px;
    }
  }
`;

class StackedNav extends React.Component<Props> {
  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}

export default StackedNav;
