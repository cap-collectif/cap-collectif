// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import * as React from 'react';
import colors, { BsStyleColors } from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type FilterTagProps = {|
  +children: React.Node,
  +icon?: ?React.Node,
  +bgColor?: ?string,
  +canClose?: boolean,
  +onClose?: ?() => void,
|};

const FilterTagContainer: StyledComponent<{ bgColor?: ?string }, {}, HTMLDivElement> = styled.div`
  border-radius: 20px;
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 12px;
  height: 18px;
  display: flex;
  color: ${colors.white};
  padding: 0 0.75rem;
  align-items: center;
  max-width: 150px;
  ${props =>
    props.bgColor
      ? css`
          background-color: ${BsStyleColors[props.bgColor] || props.bgColor};
        `
      : css`
          background-color: ${colors.darkGray};
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
  & > .icon {
    margin-right: 4px;
    font-size: 1rem;
  }
`;

const FilterTag = ({ children, icon, onClose, bgColor, canClose = true }: FilterTagProps) => (
  <FilterTagContainer bgColor={bgColor}>
    {icon}
    <span>{children}</span>
    {canClose && onClose && (
      <Icon
        onClick={onClose}
        name={ICON_NAME.crossRounded}
        color={colors.white}
        className="close-icon"
        size="0.7rem"
      />
    )}
  </FilterTagContainer>
);

export default FilterTag;
