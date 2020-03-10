// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MenuItem, Modal } from 'react-bootstrap';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

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
  h5 {
    font-size: 16px;
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
  flex-direction: row;
  > div {
    margin-right: 20px;
    min-width: 200px;
  }
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column
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

export const StepMenuItem: StyledComponent<{}, {}, typeof MenuItem> = styled(MenuItem)`
  a {
    /** Just overriding some bootstrap */
    padding: 5px 20px !important;
    font-weight: 600 !important;
  }
`;

export const StepModalTitle: StyledComponent<{}, {}, typeof Modal.Title> = styled(Modal.Title)`
  font-weight: 600;
  font-size: 20px;
`;
