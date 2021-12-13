import { createGlobalStyle } from 'styled-components';
import { BASE_PATH } from '../config';

export const FONT_PATH: string = `${BASE_PATH}/fonts`;

const Fonts = createGlobalStyle`
  @font-face {
    font-family: "Open Sans";
    font-weight: normal;
    font-style: normal;
    src: url("${FONT_PATH}/OpenSans-Regular.ttf") format("truetype")
  }

  @font-face {
      font-family: "Open Sans";
      font-weight: 600;
      font-style: normal;
      src: url("${FONT_PATH}/OpenSans-SemiBold.ttf") format("truetype")
  }

  @font-face {
      font-family: "Open Sans";
      font-weight: bold;
      font-style: normal;
      src: url("${FONT_PATH}/OpenSans-Bold.ttf") format("truetype")
  }

  @font-face {
      font-family: "Roboto";
      font-weight: normal;
      font-style: normal;
      src: url("${FONT_PATH}/Roboto-Regular.ttf") format("truetype")
  }
  @font-face {
      font-family: "Roboto";
      font-weight: 600;
      font-style: normal;
      src: url("${FONT_PATH}/Roboto-Medium.ttf") format("truetype")
  }
  @font-face {
      font-family: "Roboto";
      font-weight: 700;
      font-style: normal;
      src: url("${FONT_PATH}/Roboto-Bold.ttf") format("truetype")
  }
  
`;

export default Fonts;
