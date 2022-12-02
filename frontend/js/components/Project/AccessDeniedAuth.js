// @flow
import * as React from 'react';
import { Flex } from '@cap-collectif/ui';
import {useDispatch} from "react-redux";
import styled from 'styled-components'
import {showLoginModal} from "~/redux/modules/user";

const BackGroundImage = styled.img`
  width: 1280px;
  height: 830px;
  max-width: 100%;
  max-height: 100%;
`

const AccessDeniedAuth = (): React.Node => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(showLoginModal());
  }, [dispatch]);

  return (
    <Flex
      justifyContent="center"
      bg="white"
    >
      <BackGroundImage
        src="/image/403_auth_login.jpeg"
        alt=""
      />
    </Flex>
  );
};

export default AccessDeniedAuth;
