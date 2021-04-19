// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import { AccordionItemContext } from '~ds/Accordion/item/context';
import Button, { type ButtonProps } from '~ds/Button/Button';
import { FontWeight } from '~ui/Primitives/constants';
import Text from '~ui/Primitives/Text';
import colors from '~/styles/modules/colors';

type Props = {|
  ...ButtonProps,
  +icon: $Values<typeof ICON_NAME>,
  +disabled?: boolean,
  +text: string,
  +isOpen: boolean,
|};

// Basically an AccordionButton with custom stuff
export const SidebarButton = ({ children, icon, text, isOpen, ...props }: Props): React.Node => {
  const { disabled, toggleOpen, open } = React.useContext(AccordionItemContext);
  const button = React.useRef<HTMLButtonElement | null>(null);
  const intl = useIntl();
  const toggle = React.useCallback(() => {
    if (disabled) return;

    toggleOpen();
  }, [disabled, toggleOpen]);

  return (
    <Button
      ref={button}
      disabled={disabled}
      onClick={toggle}
      width="100%"
      fontWeight={FontWeight.Normal}
      borderRadius="0"
      color={open ? 'gray.100' : 'gray.500'}
      bg={open ? 'gray.800' : 'gray.900'}
      justifyContent={isOpen ? 'space-between' : 'center'}
      pr={isOpen ? 5 : 3}
      pb={3}
      pl={3}
      pt={3}
      css={{ '&:hover': { color: colors.gray[open ? 100 : 300] } }}
      {...props}>
      <Flex direction="row" alignItems="center">
        <Icon name={icon} size={ICON_SIZE.MD} marginRight={isOpen ? 1 : 0} />
        {isOpen && (
          <Text
            fontSize={14}
            css={{ textTransform: 'capitalize', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {intl.formatMessage({ id: text })}
          </Text>
        )}
      </Flex>
      {isOpen && (
        <Icon
          name={open ? ICON_NAME.ARROW_UP : ICON_NAME.ARROW_DOWN}
          size={ICON_SIZE.SM}
          marginLeft={1}
        />
      )}
    </Button>
  );
};

export default SidebarButton;
