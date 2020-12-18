// @flow
import { useMatchMedia } from '@liinkiing/react-hooks';
import { breakpoints } from '~/styles/theme/base';

const useIsMobile = (): boolean => useMatchMedia(`screen and (max-width: ${breakpoints[0]})`);

export default useIsMobile;
