// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent, css } from 'styled-components';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import hexToRgb from '~/utils/colors/hexToRgb';
import rgbToHsl from '~/utils/colors/rgbToHsl';
import { formatRgb, formatHsl } from '~/utils/colors/formatColor';
import Tooltip from '~ds/Tooltip/Tooltip';

export type Props = {|
  onColorClick: string => void,
  id: string,
  selectedColor: ?string,
  categoryColors: $ReadOnlyArray<{|
    +value: string,
    +used: boolean,
  |}>,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Color: StyledComponent<
  { color: string, isDisabled: boolean, disabledColor: string },
  {},
  HTMLDivElement,
> = styled.div`
  border-radius: 4px;
  height: 29px;
  width: 29px;
  background: ${({ color }) => color};
  border: ${({ color }) => `0 solid ${color}`};
  margin-right: 8px;
  outline: none;
  margin-bottom: 8px;
  padding: 4px 8px;
  ${({ isDisabled, color, disabledColor }) =>
    isDisabled
      ? css`
          background-color: ${color};
          background: repeating-linear-gradient(
            135deg,
            ${color},
            ${color} 4px,
            ${disabledColor} 0,
            ${disabledColor} 6px
          );
        `
      : css`
          :hover {
            cursor: pointer;
            padding: 6px 10px;
            height: 33px;
            width: 33px;
            margin-right: 6px;
            margin-bottom: 6px;
            margin-left: -2px;
            margin-top: -2px;
          }
        `}
`;

export const ProposalFormCategoryColor = ({
  id,
  onColorClick,
  selectedColor,
  categoryColors,
}: Props) => {
  const renderColor = (color: {| +value: string, +used: boolean |}) => {
    const rgb = hexToRgb(color.value);
    const colorRgbFormatted = formatRgb(rgb);
    const { h, s, l } = rgbToHsl(colorRgbFormatted);
    return (
      <Color
        onClick={() => {
          if (!color.used) onColorClick(color.value);
        }}
        color={color.value}
        isDisabled={color.used && color.value !== selectedColor}
        disabledColor={formatHsl({ h, s, l: l + 10 })}>
        {selectedColor === color.value && (
          <Icon name={ICON_NAME.check} size={12} color={colors.white} />
        )}
      </Color>
    );
  };

  return (
    <Container id={id}>
      {categoryColors.map(color => {
        return !color.used || color.value === selectedColor ? (
          renderColor(color)
        ) : (
          <Tooltip
            placement="top"
            label={<FormattedMessage id="already.in.use.feminine" />}
            id={`tooltip-color-${color.value}`}
            className="text-left"
            style={{ wordBreak: 'break-word' }}>
            {renderColor(color)}
          </Tooltip>
        );
      })}
    </Container>
  );
};

export default ProposalFormCategoryColor;
