// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const ProjectBoxHeader: StyledComponent<
  { noBorder?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  color: ${colors.darkText};
  border-bottom: ${({ noBorder }) => !noBorder && `1px solid ${colors.lightGray};`};
  margin-bottom: ${({ noBorder }) => !noBorder && '20px;'};
  margin-top: ${({ noBorder }) => !noBorder && '15px;'};
  h4 {
    font-size: 18px;
    font-weight: bold;
  }
`;

export const NoStepsPlaceholder: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  height: 50px;
  border: 1px solid ${colors.lightGray};
  border-radius: 4px;
  background: #fafafa;
  text-align: center;
  padding: 15px;
  color: ${colors.darkGray};
`;

export const ProjectSmallFieldsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  > div {
    margin-right: 20px;
  }
`;

export const ProjectAccessContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .radio label {
    font-weight: bold;
  }
`;

export const ProjectSmallInput: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 200px;
`;
