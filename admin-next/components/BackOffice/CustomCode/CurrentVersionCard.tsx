import { Box, Button, CapUIFontSize, CapUIFontWeight, Flex, Tag, Text } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { Version } from './customCodeVersioning.types'

type CurrentVersionCardProps = {
  currentVersion?: Version
}

export const CurrentVersionCard: FC<CurrentVersionCardProps> = ({ currentVersion }) => {
  const intl = useIntl()

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="8px" p={4} mb={4} bg="gray.100">
      <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
        <Box minWidth={0}>
          <Text color="gray.900" fontWeight={CapUIFontWeight.Semibold} mb={1}>
            {intl.formatMessage({ id: 'admin.custom-code.current-version' })}
          </Text>
          {currentVersion ? (
            <>
              <Text color="gray.900">{currentVersion.title}</Text>
              <Text color="gray.700" fontSize={CapUIFontSize.BodySmall}>
                {currentVersion.authorName} - {new Date(currentVersion.createdAt).toLocaleString('fr-FR')}
              </Text>
              {currentVersion.description ? (
                <Text color="gray.700" fontSize={CapUIFontSize.BodySmall} mt={2}>
                  {currentVersion.description}
                </Text>
              ) : null}
              {currentVersion.referenceUrl ? (
                <Button as="a" href={currentVersion.referenceUrl} target="_blank" variant="link" mt={2}>
                  {intl.formatMessage({ id: 'admin.custom-code.reference-url' })}
                </Button>
              ) : null}
            </>
          ) : (
            <Text color="gray.700">{intl.formatMessage({ id: 'admin.custom-code.no-current-version' })}</Text>
          )}
        </Box>
        {currentVersion ? (
          <Tag variantColor={currentVersion.type === 'RESTORE' ? 'warning' : 'infoGray'}>
            <Tag.Label>{currentVersion.type}</Tag.Label>
          </Tag>
        ) : null}
      </Flex>
    </Box>
  )
}
