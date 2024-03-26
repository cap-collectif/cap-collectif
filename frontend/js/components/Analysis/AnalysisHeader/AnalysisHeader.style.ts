import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const AnalysisHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #fff;
  background-color: #7c7f81;

  h1 {
    font-size: 36px;
    margin: auto;
  }

  a {
    position: absolute;
    left: 5%;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    background-color: #fff;
    color: #000;
    ${MAIN_BORDER_RADIUS};

    .icon {
      margin-right: 5px;
    }
  }
`
export default AnalysisHeaderContainer
