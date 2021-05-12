// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { AnimatePresence, m as motion } from 'framer-motion';
import Text from '~ui/Primitives/Text';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import { useTable } from '~ds/Table/context';
import { ease } from '~/utils/motion';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  ...FlexProps,
  +children?: React.Node | (({ selectedRows: string[] }) => React.Node),
|};

// Need wrapper for animation 'cause of https://github.com/framer/motion/issues/368#issuecomment-782098174
const ActionBarWrapper = motion.custom(AppBox);

const ActionBar = ({ children, ...props }: Props) => {
  const intl = useIntl();
  const { selectedRows, isLoading } = useTable();

  if (isLoading) return null;

  return (
    <AnimatePresence>
      {selectedRows.length > 0 && (
        <ActionBarWrapper
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, ease }}
          exit={{ opacity: 0, height: 0 }}>
          <Flex
            key="action-bar"
            direction="row"
            justifyContent="space-between"
            align="center"
            p={4}
            bg="gray.100"
            borderBottom="normal"
            borderColor="gray.150"
            color="gray.900"
            {...props}>
            <Text>
              {intl.formatMessage(
                { id: 'global.selected.feminine.dynamic' },
                { num: selectedRows.length },
              )}
            </Text>
            {typeof children === 'function' ? children({ selectedRows }) : children}
          </Flex>
        </ActionBarWrapper>
      )}
    </AnimatePresence>
  );
};

export default ActionBar;
