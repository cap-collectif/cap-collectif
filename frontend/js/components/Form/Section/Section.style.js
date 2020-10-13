// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .form-description {
    margin-bottom: 25px;
  }
`;

export const TitleSubSection: StyledComponent<
  { primaryColor: string },
  {},
  HTMLHeadingElement,
> = styled.h4`
  color: ${props => props.primaryColor || '#1D8393'};
  border-bottom: 1px solid ${props => props.primaryColor || '#D8D8D8'};
  padding-bottom: 8px;
  font-size: 20px;
  margin-bottom: 15px;
`;
