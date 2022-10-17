// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent, css } from 'styled-components';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import Tooltip from '~ds/Tooltip/Tooltip';

export type Props = {|
  onIconClick: (?string) => void,
  id: string,
  selectedColor: string,
  selectedIcon: ?string,
  categoryIcons: $ReadOnlyArray<{|
    +name: string,
    +used: boolean,
  |}>,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const IconContainer: StyledComponent<
  { color: string, isDisabled: boolean, isSelected: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  border-radius: 4px;
  height: 29px;
  width: 29px;
  margin-right: 8px;
  outline: none;
  margin-bottom: 8px;
  padding: 4px 8px;
  ${({ isDisabled, color, isSelected }) => css`
    ${!isDisabled &&
    !isSelected &&
    css`
      :hover {
        cursor: pointer;
        svg {
          fill: ${color} !important;
        }
      }
    `}

    ${isSelected &&
    css`
      :hover {
        cursor: pointer;
      }
      background: ${color};
    `}

        ${isDisabled &&
    css`
      svg {
        fill: #ccc !important;
      }
    `}
  `}
`;

export const ProposalFormCategoryIcon = ({
  id,
  onIconClick,
  selectedIcon,
  categoryIcons,
  selectedColor,
}: Props) => {
  const renderIcon = (icon: {| +name: string, +used: boolean |}) => {
    const isSelected = selectedIcon === icon.name;
    return (
      <IconContainer
        onClick={() => {
          if (!icon.used || isSelected) onIconClick(isSelected ? null : icon.name);
        }}
        color={selectedColor}
        isDisabled={icon.used && icon.name !== selectedIcon}
        isSelected={isSelected}>
        <Icon name={ICON_NAME[icon.name]} size={12} color={isSelected ? colors.white : '#001b38'} />
      </IconContainer>
    );
  };

  return (
    <Container id={id}>
      {categoryIcons.map(icon => {
        return !icon.used || icon.name === selectedIcon ? (
          renderIcon(icon)
        ) : (
          <Tooltip
            placement="top"
            label={<FormattedMessage id="already.in.use.feminine" />}
            id={`tooltip-icon-${icon.name}`}
            className="text-left"
            style={{ wordBreak: 'break-word' }}>
            {renderIcon(icon)}
          </Tooltip>
        );
      })}
    </Container>
  );
};

export default ProposalFormCategoryIcon;
