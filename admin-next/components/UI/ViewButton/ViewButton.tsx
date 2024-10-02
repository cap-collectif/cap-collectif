import { BoxProps, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'

export const ViewButton: React.FC<
  { active: boolean; onClick: () => void; icon: CapUIIcon; children: React.ReactNode } & BoxProps
> = ({ active, onClick, icon, children, ...rest }) => (
  <Flex
    as="button"
    px={2}
    py={1}
    justify="center"
    alignItems="center"
    onClick={onClick}
    border="normal"
    position="relative"
    aria-current={active}
    {...rest}
    borderColor={active ? 'primary.600' : 'gray.300'}
  >
    <Icon
      name={icon}
      size={CapUIIconSize.Md}
      color={active ? 'primary.600' : 'gray.700'}
      mr={1}
      aria-hidden
      focusable={false}
    />

    <Text as="span" fontSize={3} color={active ? 'primary.600' : 'gray.700'}>
      {children}
    </Text>
  </Flex>
)
export default ViewButton
