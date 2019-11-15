// @flow
import styled, { type StyledComponent } from 'styled-components';
import withColors from '../Utils/withColors';
import colors from '../../utils/colors';

const getCommentBackground = ({ bodyColor, sectionColor, useBodyColor }): string => {
  if (useBodyColor) {
    return bodyColor === '#ffffff' ? sectionColor : colors.white;
  }
  return sectionColor === '#ffffff' ? bodyColor : colors.white;
};

const CommentContainerbase: StyledComponent<
  { isHighlighted: boolean, bodyColor: string, sectionColor: string, useBodyColor: string },
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  flex-direction: row;

  & + & {
    margin-top: 10px;
  }

  .opinion {
    display: flex;
    flex-direction: column;
    width: 100%;

    .opinion__body {
      width: 100%;
      background-color: ${props => getCommentBackground(props)};
      padding: 10px;
      border-radius: 10px;
      border: ${props => (props.isHighlighted ? `1px solid ${colors.primaryColor}` : undefined)};
    }
  }
`;

export const CommentContainer = withColors(CommentContainerbase);

export const CommentAnswersContainer: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  width: 100%;
  margin: 20px 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: 10px;
  }
`;
