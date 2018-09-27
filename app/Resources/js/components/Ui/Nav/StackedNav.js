// // @flow
import styled from 'styled-components';
import * as React from 'react';

type Props = {
  children: ?React.Node,
};

export const Container = styled.div.attrs({
  className: 'stacked-nav',
})`
  background-color: #f6f6f6;

  .stacked-nav__header {
    color: $dark-gray;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e3e3e3;
    text-transform: uppercase;

    a {
      color: $dark-gray;
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
      text-decoration: none;
      cursor: pointer;
    }

    .nav {
      li {
        border: 1px solid $page-bgc;

        a {
          color: $black;
        }

        &.active a,
        &:hover a,
        a:focus {
          color: $black;
          background-color: transparent;
        }

        &.active,
        &:hover {
          background-color: $white;
          border: 1px solid $border-color;
        }
      }

      .level {
        @for $i from 0 to 4 {
          $p: 20 * $i;
          $w: 600 - ($i * 100);
          &--#{$i} {
            padding-left: #{$p}px;
            font-weight: #{$w};
          }
        }
      }
    }
  }

  .stacked-nav__footer {
    padding: 15px 0;
    color: $black;

    a {
      color: $black;
      font-weight: 300;
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
