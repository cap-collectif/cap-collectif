import type { StyledComponent } from 'styled-components'
import styled, { css } from 'styled-components'
import { BASE_INPUT, MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import colors from '~/utils/colors'

export const SearchContainer = styled.div<{
  hasLocationUser: boolean
  hasReset: boolean
}>`
  position: relative;
  display: flex;
  flex-direction: row;

  &:hover {
    .btn-reset {
      display: flex;
    }
  }

  .icon-search {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  input {
    ${BASE_INPUT};
    width: 100%;
    padding-left: 30px;
    border-radius: ${props =>
      props.hasLocationUser ? `${MAIN_BORDER_RADIUS_SIZE} 0 0 ${MAIN_BORDER_RADIUS_SIZE}` : MAIN_BORDER_RADIUS_SIZE};
    ${({ hasReset }) =>
      hasReset &&
      `
      padding-right: 44px;
    `}
  }

  .btn-reset {
    display: none;
    background: none;
    border: none;
    position: absolute;
    right: ${props => (props.hasLocationUser ? '40px' : '8px')};
    top: 50%;
    transform: translateY(-50%);
  }
`
export const ButtonLocation = styled.button<{
  isMobile?: boolean
}>`
  background-color: #fafafa;
  border: 1px solid ${colors.lightGray};
  border-radius: ${props =>
    props.isMobile ? MAIN_BORDER_RADIUS_SIZE : `0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0`};
  border-left: ${({ isMobile }) => !isMobile && 'none'};
  padding: 0 10px;
  height: ${({ isMobile }) => isMobile && '35px'};
`
export const LoaderContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  background-color: #fff;
  width: 100%;
  padding: 20px;
  border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
  border: 1px solid ${colors.lightGray};
`
export const ResultContainer: StyledComponent<any, {}, HTMLUListElement> = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
  border: 1px solid ${colors.lightGray};
  border-top: none;
  overflow: hidden;

  li {
    padding: 10px;
    cursor: pointer;

    span:first-of-type {
      font-weight: bold;
    }
  }
`
export const getStyleSearchBarAddress = (side: 'left' | 'right' = 'left') => css`
  position: absolute;
  top: 15px;
  left: ${side === 'left' ? '15px' : 'initial'};
  right: ${side === 'right' ? '15px' : 'initial'};
  z-index: 1;

  input {
    width: 75vw;
    max-width: 300px;
  }
`
