import { FC, ChangeEvent, Fragment } from 'react'
import {
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  headingStyles,
  Switch,
  Tag,
  Text,
  Checkbox,
  ListCard,
} from '@cap-collectif/ui'
import { Section } from '@ui/Section'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { useIntl } from 'react-intl'
import { useNavBarContext } from '../../NavBar/NavBar.context'
import { useFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { toggleFeatureFlag } from '@mutations/ToggleFeatureMutation'

type SSOToggle = {
  label: string
  featureFlag: FeatureFlagType
}

const SSO_TOGGLES: SSOToggle[] = [
  {
    label: 'FranceConnect',
    featureFlag: 'login_franceconnect',
  },
  {
    label: 'Open ID',
    featureFlag: 'login_openid',
  },
  {
    label: 'SAML',
    featureFlag: 'login_saml',
  },
  {
    label: 'CAS',
    featureFlag: 'login_cas',
  },
]

const SSOToggleList: FC = () => {
  const intl = useIntl()
  const { setSaving } = useNavBarContext()
  const features = useFeatureFlags([
    'login_franceconnect',
    'login_openid',
    'login_saml',
    'login_cas',
    'oauth2_switch_user',
  ])

  return (
    <Flex direction="column" mt={9}>
      <Flex direction="row" mb={2} spacing={2}>
        <Text color="gray.900" {...headingStyles.h4}>
          {intl.formatMessage({ id: 'activate-custom-authentication-method' })}
        </Text>

        <Tag variantColor="infoGray">
          <Tag.LeftIcon name={CapUIIcon.LockOpen} size={CapUIIconSize.Sm} mr={0} />
        </Tag>
      </Flex>
      <Section.Description mb={4}>
        {intl.formatMessage({
          id: 'activate-custom-authentication-method-description',
        })}
      </Section.Description>

      <ListCard>
        {SSO_TOGGLES.map(ssoToggle => (
          <Fragment key={ssoToggle.featureFlag}>
            <ListCard.Item as="label" htmlFor={ssoToggle.featureFlag}>
              <ListCard.Item.Label color="gray.900" fontWeight={CapUIFontWeight.Semibold}>
                {ssoToggle.label}
              </ListCard.Item.Label>

              <Switch
                id={ssoToggle.featureFlag}
                checked={features[ssoToggle.featureFlag]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  toggleFeatureFlag(ssoToggle.featureFlag, e.target.checked, intl, setSaving)
                }
              />
            </ListCard.Item>
            {ssoToggle.featureFlag === 'login_openid' && features.login_openid && (
              <ListCard.SubItem>
                <Checkbox
                  checked={features.oauth2_switch_user}
                  id="openID-switch-user"
                  onChange={e => {
                    toggleFeatureFlag('oauth2_switch_user', (e.target as HTMLInputElement).checked, intl, setSaving)
                  }}
                >
                  {intl.formatMessage({
                    id: 'capco.module.oauth2_switch_user',
                  })}
                </Checkbox>
              </ListCard.SubItem>
            )}
          </Fragment>
        ))}
      </ListCard>
    </Flex>
  )
}

export default SSOToggleList
