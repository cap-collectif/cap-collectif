import styled from 'styled-components'
import { Link as RouterLink } from 'react-router-dom'
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import { baseUrl } from '~/config'

export const Container = styled.div.attrs({
  className: 'user-invitation-page',
})`
  display: flex;
  flex-direction: row;
  height: 100%;

  & > div {
    width: 50%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;

    & > div {
      width: 100%;
    }

    .content-container {
      border-radius: 10px 10px 0 0;
    }
  }
`
export const LogoContainer = styled.div.attrs({
  className: 'logo-container',
})<{
  bgColor: string
}>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor};

  img {
    max-width: 300px;
    max-height: 130px;
    z-index: 1;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    order: -1;
    flex-shrink: 0;
    height: 22px;

    img {
      display: none;
    }
  }
`
export const Symbols = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('${baseUrl}/image/pattern-triangle.png');
  background-size: 10%;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    display: none;
  }
`
export const ContentContainer = styled.div.attrs({
  className: 'content-container',
})<{
  primaryColor: string
  btnText: string
}>`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 100px 130px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  z-index: 1;
  overflow: scroll;

  h1 {
    font-size: 30px;
    margin-bottom: 20px;
    color: ${props => props.primaryColor};
  }

  .welcome {
    font-size: 22px;
  }

  .btn-submit {
    display: flex; /* flex to fix safari centering */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    background-color: ${props => props.primaryColor};
    color: ${props => props.btnText};
    border: none;
    padding: 16px 35px;
  }

  @media only screen and (min-width: ${mediaQueryTablet.minWidth}) and (max-width: ${mediaQueryTablet.maxWidth}) {
    overflow: scroll;
    padding: 50px;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    box-shadow: none;
    padding: 40px 20px 60px 20px;

    h1 {
      font-size: 25px;
    }

    .welcome {
      font-size: 18px;
    }

    .btn-submit {
      position: fixed;
      right: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
    }
  }
`
export const BackLink = styled(RouterLink)`
  text-decoration: none;
  color: #85919d !important;
  font-weight: 600;
  margin-left: 8px;
  font-size: 14px;
`
