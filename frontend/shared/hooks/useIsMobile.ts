import { useMatchMedia } from '@liinkiing/react-hooks'

const useIsMobile = (): boolean => useMatchMedia(`screen and (max-width: 767px)`)

export default useIsMobile
