// @flow
import * as React from 'react';
import {useIntl} from "react-intl";
import {useSelector} from "react-redux";
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import Link from '~ds/Link/Link';
import { baseUrl } from '~/config';
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon';
import type {GlobalState} from "~/types";


const AccessDenied = (): React.Node => {
  const intl = useIntl();

  const { btnBgColor, btnTextColor } = useSelector((state: GlobalState) => ({
    btnBgColor: state.default.parameters['color.btn.primary.bg'],
    btnTextColor: state.default.parameters['color.btn.primary.text'],
  }));


  return (
    <Flex
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
      bg="white"
      pb="100px"
      pt="100px"
    >
      <Text fontSize={5} fontWeight={600} mb={2}>{intl.formatMessage({id: 'unauthorized-access'})}</Text>
      <Text fontSize={4} mb="41px" textAlign="center">{intl.formatMessage({id: 'restricted-access'})}</Text>
      <SpotIcon name={SPOT_ICON_NAME.LOCK_EYE} size={SPOT_ICON_SIZE.XL} mb="41px" />
      <Button
        bg={`${btnBgColor} !important`}
        color={`${btnTextColor} !important`}
        variant="primary"
        variantSize="big"
        mb={4}
        as="a"
        href={baseUrl}
        style={{'text-decoration': 'none'}}
      >
        {intl.formatMessage({id: 'back-to-homepage'})}
      </Button>
      <Link href={`${baseUrl}/contact`} fontSize={3}>{intl.formatMessage({id: 'error.report'})}</Link>
    </Flex>
  );
};

export default AccessDenied;
