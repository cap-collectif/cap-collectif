import * as React from 'react'
import styled from 'styled-components'
import CategoryBackground from '@ui/CategoryBackground/CategoryBackground'
import { Box, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import convertIconToDs from '@components/Steps/CollectStep/ProposalFormAdminCategories.utils'
import { useIntl } from 'react-intl'

export interface ProposalFormCategoryBackgroundPreviewProps {
  color: string | null
  icon: string | null
  name: string | null
  customCategoryImage: {
    id: string
    image: {
      url: string
      id: string
    } | null
  } | null
}

const CircledIcon = styled.div`
  width: 24px;
  min-width: 24px;
  height: 24px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.175);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ProposalFormCategoryBackgroundPreview: React.FC<ProposalFormCategoryBackgroundPreviewProps> = ({
  name,
  icon,
  color,
  customCategoryImage,
}) => {
  const intl = useIntl()
  return (
    // @ts-ignore
    <Box
      width="49%"
      height="100%"
      borderRadius={1}
      border="1px solid #e3e3e3"
      position="relative"
      sx={{
        '> svg#background': {
          margin: '-1px',
          position: 'absolute',
        },
      }}
      overflow="hidden"
    >
      {customCategoryImage ? (
        <Box
          as="img"
          src={customCategoryImage.image?.url}
          alt="Category background"
          width="100%"
          sx={{ objectFit: 'cover' }}
          height="calc(100% - 38px)"
          marginBottom="3px"
          maxHeight="80px"
        />
      ) : (
        <>
          {icon && (
            <Icon
              zIndex={1}
              position="absolute"
              top="calc(calc(50% - 22px) - 22px)"
              left="calc(50% - 24px)"
              name={CapUIIcon[convertIconToDs(icon)]}
              size={CapUIIconSize.Xl}
              color="white"
            />
          )}
          <CategoryBackground color={color} />
        </>
      )}
      <Flex
        padding="4px 12px 7px"
        align="center"
        height="35px"
        position="absolute"
        backgroundColor="white"
        width="100%"
        bottom={0}
      >
        <CircledIcon>
          <Icon name={CapUIIcon.TagO} size={CapUIIconSize.Md} color="blue.500" />
        </CircledIcon>
        <Box
          as="span"
          marginLeft={2}
          sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          overflow="hidden"
          color={!name ? '#a2abb4' : 'inherit'}
        >
          {name || intl.formatMessage({ id: 'category.without.title' })}
        </Box>
      </Flex>
    </Box>
  )
}

export default ProposalFormCategoryBackgroundPreview
