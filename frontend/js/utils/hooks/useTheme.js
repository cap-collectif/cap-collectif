// @flow
import { ThemeContext } from 'styled-components';
import { useContext } from 'react';

const useTheme = () => {
  return useContext(ThemeContext);
};

export default useTheme;
