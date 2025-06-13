import * as React from 'react'
import {
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Flex,
  FlexProps,
  Icon,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { useSideBarContext } from '@ui/SideBar/SideBar.context'
import { useIntl } from 'react-intl'

interface SideBarItemProps extends FlexProps {
  id: string
  title: string
  icon: CapUIIcon
  href: string
  beta?: boolean
}

export const SideBarItem: React.FC<SideBarItemProps> = ({ id, title, icon, href, beta, ...props }) => {
  const { menuOpen, fold } = useSideBarContext()
  const isSelected = menuOpen === id
  const intl = useIntl()

  return (
    <Flex
      as="a"
      direction="row"
      bg={isSelected ? 'gray.800' : 'gray.900'}
      href={href}
      className="sideBar__item"
      align="center"
      justify={fold ? 'space-between' : 'center'}
      px={3}
      py={2}
      lineHeight={CapUILineHeight.M}
      _hover={{
        '.sideBar__item--title, .sideBar__item--icon': { color: 'gray.100' },
      }}
      {...props}
    >
      <Flex direction="row" spacing={2} align="center">
        <Icon
          name={icon}
          size={CapUIIconSize.Md}
          color={isSelected ? 'gray.300' : 'gray.500'}
          className="sideBar__item--icon"
        />
        {fold && (
          <Text
            fontSize={CapUIFontSize.BodyRegular}
            fontWeight={CapUIFontWeight.Semibold}
            lineHeight={CapUILineHeight.S}
            color={isSelected ? 'blue.100' : 'gray.500'}
            className="sideBar__item--title"
          >
            {title}
          </Text>
        )}
      </Flex>

      {beta && fold && (
        <Tag variantColor="info">
          <Tag.Label>{intl.formatMessage({ id: 'global.beta' })}</Tag.Label>
        </Tag>
      )}
    </Flex>
  )
}

export default SideBarItem
