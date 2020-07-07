// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import Collapsable from '~ui/Collapsable';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const Container: StyledComponent<
  { hasMarginRight: boolean },
  {},
  typeof Collapsable,
> = styled(Collapsable)`
  background-color: #fff;
  border: 1px solid ${colors.borderColor};
  padding: 6px 10px;
  margin-right: ${props => (props.hasMarginRight ? '10px' : 0)};
  ${MAIN_BORDER_RADIUS};

  span {
    padding: 0;
  }

  p {
    margin-left: 6px;
  }

  .no-transform-svg {
    transform: none;
    margin: 0;
  }
`;

export const ButtonInformation: StyledComponent<{}, {}, HTMLAnchorElement> = styled.a`
  .icon {
    margin: 0;
  }

  &:hover {
    .icon {
      fill: ${colors.blue};
    }
  }
`;

export const TitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
