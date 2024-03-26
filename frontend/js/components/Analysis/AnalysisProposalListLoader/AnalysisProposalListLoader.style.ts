import styled from 'styled-components'

const AnalysisProposalListLoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  font-weight: 600;

  .loader {
    width: auto;
    & > div {
      margin: 0 2rem 0 0;
    }
  }
`
export default AnalysisProposalListLoaderContainer
