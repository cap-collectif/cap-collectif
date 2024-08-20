import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Container } from './NoCampaign.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'

const NoCampaign = () => (
  <Container>
    <Icon name={ICON_NAME.fileIcon2} color={colors.darkGray} size={42} />

    <FormattedMessage id="empty.emailingCampaign" tagName="p" />
    <FormattedMessage id="empty.emailingCampaign.indication" tagName="p" />
  </Container>
)

export default NoCampaign
