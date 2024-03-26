import styled from 'styled-components'
import { Panel } from 'react-bootstrap'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'

export const Container = styled(Panel)<{
  active: boolean
  isMobile: boolean
}>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  border: none;
  margin-top: 20px;
`
export const ColorRow = styled.div.attrs({
  className: 'color-row',
})<{ isMobile?: boolean }>`
  margin-top: 10px;
  height: 60px;
  display: inline-flex;
  width: 100%;

  .median-indicator {
    border-left: 2px dotted #000;
    width: 1px;
    position: relative;
    height: 60px;
    left: 50%;
  }

  .answer-option {
    height: 30px;
    min-width: ${({ isMobile }) => (isMobile ? '20px' : '50px')};
    color: #fff;
    margin-top: 30px;
    display: flex;
    flex: 1;
    justify-content: center;

    &:first-of-type {
      border-radius: ${MAIN_BORDER_RADIUS_SIZE} 0 0 ${MAIN_BORDER_RADIUS_SIZE};
    }

    &:last-of-type {
      border-radius: 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0;
    }
  }
`
export const GraphContainer = styled.div.attrs({
  className: 'graph-container',
})<{ isMobile?: boolean }>`
  display: flex;
  flex: 3;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  margin-bottom: 30px;
  padding-left: ${({ isMobile }) => (isMobile ? '15px' : '10px')};
  padding-right: ${({ isMobile }) => (isMobile ? '15px' : '0')};
`
export const ResponseContainer = styled.div.attrs({
  className: 'response-container',
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 50px;
  margin-left: 20px;

  .line-level {
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    max-width: 275px;
    justify-content: space-between;

    .main-info-line {
      font-weight: 600;
    }
  }

  .response-number-container {
    font-weight: bold;
    margin-bottom: 10px;
  }
`
