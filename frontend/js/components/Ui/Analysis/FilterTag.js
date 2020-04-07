// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import * as React from 'react';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors, { BsStyleColors } from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type FilterTagProps = {|
  +children: React.Node,
  +show: boolean,
  +icon?: React.Node,
  +bgColor?: string,
  +canClose?: boolean,
  +onClose?: () => void,
|};

const FilterTagContainer: StyledComponent<{ bgColor?: string }, {}, HTMLDivElement> = styled.div`
  ${MAIN_BORDER_RADIUS};
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 1.2rem;
  height: 22px;
  display: flex;
  color: ${colors.white};
  padding: 0.25rem 0.75rem;
  align-items: baseline;
  ${props =>
    props.bgColor
      ? css`
          background: ${BsStyleColors[props.bgColor] || colors.primaryColor};
        `
      : css`
          background: ${colors.darkGray};
        `}
  & > span {
    max-width: 120px;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-height: 16px;
    overflow: hidden;
  }
  & > svg.close-icon {
    color: inherit;
    margin-left: 6px;
    &:hover {
      cursor: pointer;
    }
  }
`;

const FilterTag = ({ children, show, icon, onClose, bgColor, canClose = true }: FilterTagProps) => {
  if (!show) return null;
  return (
    <FilterTagContainer bgColor={bgColor}>
      {icon}
      <span>{children}</span>
      {canClose && (
        <Icon
          onClick={onClose}
          name={ICON_NAME.close}
          color={colors.white}
          className="close-icon"
          size="0.7rem"
        />
      )}
    </FilterTagContainer>
  );
};

export default FilterTag;
