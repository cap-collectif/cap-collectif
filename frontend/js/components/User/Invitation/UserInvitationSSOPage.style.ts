import styled from 'styled-components'

import AppBox from '~ui/Primitives/AppBox'
import Flex from '~ui/Primitives/Layout/Flex'
import { mediaQueryMobile } from '~/utils/sizes'

export const Line = styled(AppBox).attrs({
  backgroundColor: 'gray.200',
  width: '100%',
})`
  height: 1px;
`
export const Container = styled(Flex).attrs({
  height: '100vh',
  backgroundColor: 'white',
})`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
  }
`
export const LeftSide = styled(Flex).attrs({
  width: '50%',
  direction: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  p: 4,
})`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
    height: 100%;
  }
`
export const LeftSideInner = styled(Flex).attrs({
  direction: 'column',
  maxWidth: '410px',
})`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    height: 100%;
    justify-content: space-between;
    align-items: center;
  }
`
export const RigthSide = styled(Flex)`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
    order: -1;
    padding: 24px 0;
  }
`
export const ButtonsContainer = styled(Flex).attrs({
  direction: 'column',
  display: 'inline-flex',
  width: '325px',
})`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
export const Logo = styled.img`
  max-width: 300px;
  max-height: 130px;
`
export const WelcomeMessage = styled(AppBox).attrs({
  mb: 6,
})`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 325px;
  }
`
