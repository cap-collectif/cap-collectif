// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Collapsable from '~ui/Collapsable';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import DropdownSelect from '~ui/DropdownSelect';
import { Container, TitleContainer, ButtonInformation } from './ExportButton.style';

type Props = {
  children: React.Node,
  onChange: string => void,
  linkHelp: string,
  hasMarginRight?: boolean,
  disabled?: boolean,
};

const ExportButton = ({
  children,
  onChange,
  linkHelp,
  hasMarginRight = false,
  disabled,
}: Props) => {
  const intl = useIntl();

  return (
    <Container align="right" hasMarginRight={hasMarginRight} id="export-button" disabled={disabled}>
      <Collapsable.Button>
        <Icon
          name={ICON_NAME.download}
          size={12}
          className="no-transform-svg"
          color={colors.black}
        />
        <FormattedMessage tagName="p" id="global.export" />
      </Collapsable.Button>

      <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'label.export.by.step' })}>
        <DropdownSelect
          onChange={value => onChange(value)}
          title={
            <TitleContainer>
              <FormattedMessage id="pop.over.label.export.data-set" />
              <ButtonInformation target="_blank" rel="noopener noreferrer" href={linkHelp}>
                <Icon
                  name={ICON_NAME.information}
                  size={16}
                  color={colors.iconGrayColor}
                  title={intl.formatMessage({ id: 'label.export.by.step' })}
                />
              </ButtonInformation>
            </TitleContainer>
          }>
          {children}
        </DropdownSelect>
      </Collapsable.Element>
    </Container>
  );
};

export default ExportButton;
