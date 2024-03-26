import styled from 'styled-components'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  color: ${colors.darkGray};
  padding-top: 10px;

  p {
    width: 40%;
    text-align: center;

    &:first-of-type {
      font-weight: bold;
    }
  }

  a {
    color: ${colors.blue};
    cursor: pointer;
  }
`
export const Tiles = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
  list-style: none;
  margin-top: 30px;
  padding: 0;
  width: 60%;

  li {
    flex: 0 0 30%;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 25px 0;
      margin: 0 16px 16px 0;
      background-color: #fff;
      border: 1px solid ${colors.lightGray};
      ${MAIN_BORDER_RADIUS};

      &.disabled {
        pointer-events: none;
        cursor: default;
        text-decoration: none;
        color: #000;
        opacity: 0.5;
      }

      span {
        max-width: 150px;
      }

      &:hover {
        border: 1px solid ${colors.blue};
      }
    }
  }

  .icon {
    margin-bottom: 10px;
  }
`
