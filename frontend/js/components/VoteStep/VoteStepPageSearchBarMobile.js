// @flow
import * as React from 'react';
import {
  Box,
  CapUIFontFamily,
  CapUILineHeight,
  Flex,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import {useVoteStepContext} from "~/components/VoteStep/Context/VoteStepContext";

type Props = {|
  +onClick: Function,
|};

const VoteStepPageSearchBarMobile = ({ onClick }: Props) => {
  const intl = useIntl();
  const {filters} = useVoteStepContext();
  const {address} = filters;
  
  return (
    <Flex
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      direction="row"
      zIndex={2}
      p="6px"
      boxShadow="small"
      sx={{
        fontFamily: CapUIFontFamily.Input,
        lineHeight: CapUILineHeight.Base,
        color: 'gray.900',
        bg: 'white',
      }}>
      <Box
        as="input"
        disableFocusStyles
        width="100%"
        bg="inherit"
        className="geo-search-bar-input"
        placeholder={address || intl.formatMessage({ id: 'vote.step.search' })}
        sx={{ background: 'inherit', borderWidth: '0px', fontSize: '14px !important' }}
      />
    </Flex>
  );
};

export default VoteStepPageSearchBarMobile;
