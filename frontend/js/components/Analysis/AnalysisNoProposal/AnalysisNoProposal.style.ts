import styled from 'styled-components'
import colors from '~/utils/colors'

const AnalysisNoProposalContainer = styled.div`
  padding: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${colors.darkGray};
  background: ${colors.white};
  font-size: 16px;

  .icon {
    margin-bottom: 15px;
  }

  p {
    max-width: 50%;
    text-align: center;
    &:first-of-type {
      font-weight: bold;
    }
  }
`
export default AnalysisNoProposalContainer
