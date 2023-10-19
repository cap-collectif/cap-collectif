import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { QueryRenderer, graphql } from 'react-relay'
import type { FontAdminPageQueryResponse } from '~relay/FontAdminPageQuery.graphql'
import '~relay/FontAdminPageQuery.graphql'
import environment, { graphqlError } from '~/createRelayEnvironment'
import Loader from '~/components/Ui/FeedbacksIndicators/Loader'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import FontAdminContent from './FontAdminContent/FontAdminContent'
import FontAdminPageContainer from './FontAdminPage.style'
import colors from '~/utils/colors'

const listFont = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: FontAdminPageQueryResponse | null | undefined
}) => {
  if (error) return graphqlError

  if (props) {
    const { fonts } = props
    if (fonts) return <FontAdminContent fonts={fonts} />
    return graphqlError
  }

  return <Loader />
}

export const FontAdminPage = () => (
  <FontAdminPageContainer>
    <div className="box-header">
      <div>
        <h3>
          <FormattedMessage id="global-typeface" />
        </h3>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://aide.cap-collectif.com/article/167-personnaliser-la-police-decriture"
        >
          <Icon name={ICON_NAME.information} size={16} color={colors.primaryColor} />
          <FormattedMessage id="global.help" />
        </a>
      </div>
      <p className="info">
        <FormattedMessage id="font-setting-saved-in-real-time" />
      </p>
    </div>

    <div className="box-content">
      <QueryRenderer
        environment={environment}
        query={graphql`
          query FontAdminPageQuery {
            fonts {
              ...FontAdminContent_fonts
            }
          }
        `}
        variables={{}}
        render={listFont}
      />
    </div>
  </FontAdminPageContainer>
)
export default FontAdminPage
