// @flow
import styled, { type StyledComponent } from 'styled-components';
import css from '@styled-system/css'
import AppBox from "~ui/Primitives/AppBox";
import Flex from "~ui/Primitives/Layout/Flex";

export const SectionContainer: StyledComponent<
  {},
  {},
  HTMLDivElement
  > = styled(AppBox)`
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin: 0 0 21px 0;
    label {
      font-weight: 400 !important;
    }
    input[type="number"] {
      width: 55px;
    }
    h1 {
      font-size: 18px;
      color: #003670;
      font-weight: 600;
      margin: 0 0 24px 0;
    }
`;

export const SectionInner: StyledComponent<
  {},
  {},
  HTMLDivElement
  > = styled(AppBox)`
    max-width: 747px;
`;

export const PreviewLink: StyledComponent<
  {},
  {},
  typeof Flex
  > = styled(Flex).attrs({ color: 'blue.500' })`
    a {
      ${css({ color: 'blue.500' })};
      font-weight: 600;
    }
  `


export const ProjectCard: StyledComponent<
  {},
  {},
  HTMLDivElement
  > = styled(AppBox).attrs({ mb: 4, borderRadius: "accordion", p: 2, boxShadow: 'small', backgroundColor: 'white'})`
    img {
      width: 112px;
      height: 69px;
      object-fit: cover;  
      border-radius: 4px;
    }
    p {
      display: flex;
      align-items: center;
      font-weight: 600;
      margin: 0 0 0 15px;
    }
  `

