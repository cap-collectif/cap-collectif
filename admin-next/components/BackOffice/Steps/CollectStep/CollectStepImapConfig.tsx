import React from 'react'
import { Flex, Switch, Text, CapUIFontSize, Button, Icon, CapUIIcon, CapUIIconSize, Link } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { SendEmailSVG } from '@components/BackOffice/Steps/CollectStep/assets/SendEmailSVG'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

type Props = {
  children: React.ReactNode
}

const CollectStepImapConfig: React.FC<Props> = ({ children }) => {
  const intl = useIntl()
  const { setValue, watch } = useFormContext()
  const collectByEmailFeatureFlag = useFeatureFlag('collect_proposals_by_email')
  const enabled = watch('isCollectByEmailEnabled')

  return (
    <Flex
      p="14px"
      my={4}
      bg="#F7F7F8"
      borderColor="#EBEBEB"
      borderRadius="0.25rem"
      borderWidth="1px"
      direction="column"
    >
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <Flex direction="column">
          <Flex alignItems="center" gap={1}>
            <Text fontWeight={600}>{intl.formatMessage({ id: 'activate-email-collect' })}</Text>
            <Link target="_blank" href="https://aide.cap-collectif.com/article/379-participation-par-email">
              <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
            </Link>
          </Flex>
          <Text>{intl.formatMessage({ id: 'allow-user-to-submit-proposal-by-email' })}</Text>
        </Flex>
        <Switch
          id="enabled"
          checked={enabled}
          onChange={() => {
            setValue('isCollectByEmailEnabled', !enabled)
          }}
          disabled={!collectByEmailFeatureFlag}
        />
      </Flex>
      {!collectByEmailFeatureFlag && (
        <Flex
          mt={3}
          borderRadius="4px"
          padding="16px"
          backgroundColor="#FAFCFF"
          height="128px"
          borderColor="#E0EFFF"
          alignItems="center"
          borderWidth="1px"
          gap={4}
        >
          <SendEmailSVG />
          <Flex direction="column">
            <Text fontSize={CapUIFontSize.BodySmall} fontWeight={600}>
              {intl.formatMessage({ id: 'boost-participation-with-email' })}
            </Text>
            <Text fontSize={CapUIFontSize.BodySmall}>
              {intl.formatMessage({ id: 'proposal-collect-email-help-text-body' })}
            </Text>
            <Button
              as="a"
              target="_blank"
              href="https://aide.cap-collectif.com/article/379-participation-par-email"
              variant="tertiary"
            >
              {intl.formatMessage({ id: 'learn.more' })}
            </Button>
          </Flex>
        </Flex>
      )}
      {enabled ? children : null}
    </Flex>
  )
}

export default CollectStepImapConfig
