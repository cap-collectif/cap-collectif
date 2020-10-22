// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';
import colors from '~/utils/colors';

export const Container: StyledComponent<
  { selected: boolean },
  {},
  typeof PickableList.Row,
> = styled(PickableList.Row)`
  background-color: ${props => (props.selected ? '#ECF5FF' : '#fff')};

  & > .pickableList-row-content {
    display: flex;
    flex-direction: column;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;

    a {
      color: ${colors.blue};
    }
  }

  .icon {
    margin-right: 5px;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

export const InfoRow: StyledComponent<{}, {}, HTMLParagraphElement> = styled.p`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 0;

  p {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0;
  }

  .label-status {
    color: #afafaf;
  }

  .separator {
    margin: 0 5px;
  }
`;

export const Circle: StyledComponent<{ color: string }, {}, HTMLSpanElement> = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props => props.color};
  margin-right: 5px;
`;
