// // @flow
import styled from 'styled-components';
import * as React from 'react';

type Props = {
  children: ?React.Node,
};

const Container = styled.div.attrs({
  className: 'stacked-nav',
})`
  background-color: #F6F6F6;
  width: 100%;
  
  a, a:hover {
    text-decoration: none;
  }
  
  .stacked-nav__header {
    color: #707070;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e3e3e3;
    text-transform: uppercase;

    a {
      color: #707070;
    }

    .cap {
      top: 5px;
    }

    .cap-android-menu {
      font-size: 21px;
    }

    .cap-delete-1 {
      font-size: 12px;
    }
  }
  
  .stacked-nav__list {
    a {
      cursor: pointer;
    }

    .nav {
      li {
        a {
          color: #000000;
          border: 1px solid #F6F6F6;
        }

        &.active a,
        &:hover a,
        a:focus {
          color: #000000;
          background-color: transparent;
        }

        & a.active,
        & a:hover {
          background-color: #FFFFFF;
          border: 1px solid #E3E3E3;
        }
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

    a {
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
