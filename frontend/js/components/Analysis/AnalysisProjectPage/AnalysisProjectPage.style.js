// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const AnalysisProjectPageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 60px;

  h2 {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin: 0 0 30px 0;
  }
`;

export const ProposalListNoContributions: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${colors.darkGray};
  flex-direction: column;
  background: ${colors.white};

  .icon {
    margin-bottom: 10px;
  }
`;

export const ProposalListLoaderContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  font-weight: 600;
  & .loader {
    width: auto;
    & > div {
      margin: 0 2rem 0 0;
    }
  }
`;

export default AnalysisProjectPageContainer;
