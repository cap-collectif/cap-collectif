// // @flow
import styled from 'styled-components';
import * as React from 'react';

type Props = {
  children: ?React.Node,
};

const Container = styled.div.attrs({
  className: 'stacked-nav',
})`
  background-color: #f6f6f6;
  width: 100%;

  a,
  a:hover,
  button,
  button:hover {
    text-decoration: none;
  }

  .stacked-nav__header {
    color: #707070;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e3e3e3;
    text-transform: uppercase;
    padding-bottom: 10px;

    .btn-link {
      color: #707070;
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
    .nav {
      li {
        button.active,
        button:hover {
          background-color: #ffffff;
          border: 1px solid #e3e3e3;
        }
      }

      .btn-link {
        color: #000000;
        border: 1px solid #f6f6f6;
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
  }

  .stacked-nav__footer {
    padding: 15px 0;
    color: #000000;

    .btn-link {
      font-weight: 300;
      font-size: 16px;

      &:not(:hover) {
        color: #000000;
      }
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
