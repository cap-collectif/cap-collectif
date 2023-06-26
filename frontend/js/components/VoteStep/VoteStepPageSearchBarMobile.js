// @flow
import * as React from 'react';
import {
  Box,
  CapUIFontFamily,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Flex,
  Icon,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import {useVoteStepContext} from "~/components/VoteStep/Context/VoteStepContext";

type Props = {|
  +onClick: Function,
|};

const VoteStepPageSearchBarMobile = ({ onClick }: Props) => {
  const intl = useIntl();
  const {filters, view, } = useVoteStepContext();
  const {address, term} = filters;

  const getPlaceholder = () => {
    if (view === 'map') {
      return address || intl.formatMessage({id: 'geo.search.bar.placeholder'})
    }
    if (view === 'list') {
      return term || intl.formatMessage({id: 'vote.step.search'})
    }
  }

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
      {
        view === 'map' && (
          <Box
            as="button"
            onClick={e => {
              e.preventDefault();
            }}
            type="button"
            sx={{
              cursor: 'pointer',
              background: 'inherit',
              borderWidth: '0px',
              display: 'flex',
              alignItems: 'center',
            }}>
            <Icon name={CapUIIcon.LocationTarget} size={CapUIIconSize.Lg} color="gray.900" />
          </Box>
        )
      }
      <Box
        as="input"
        disableFocusStyles
        width="100%"
        bg="inherit"
        className="geo-search-bar-input"
        placeholder={getPlaceholder()}
        sx={{ background: 'inherit', borderWidth: '0px', fontSize: '14px !important' }}
      />
    </Flex>
  );
};

export default VoteStepPageSearchBarMobile;
