// @flow
import styled from 'styled-components';
import colors from '../../utils/colors';

const getCommentBackground = ({ isAnswer, invertedBackground }) => {
  if (isAnswer && invertedBackground) return colors.pageBgc;
  if (isAnswer && !invertedBackground) return colors.white;
  if (!isAnswer && invertedBackground) return colors.white;

  return colors.pageBgc;
};

export const CommentContainer = styled.div`
  background-color: ${props => getCommentBackground(props)};
  padding: 10px;
  border-radius: 10px;
  border: ${props => (props.isHighlighted ? `1px solid ${colors.primaryColor}` : undefined)};

  & + & {
    margin-top: 10px;
  }
`;

export const CommentAnswersContainer = styled.ul`
  width: 100%;
  margin: 20px 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: 10px;
  }
`;
