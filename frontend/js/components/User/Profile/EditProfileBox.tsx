import React, { Component } from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import EditProfileTabs from './EditProfileTabs'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import environment, { graphqlError } from '../../../createRelayEnvironment'
import type { EditProfileBoxQueryResponse } from '~relay/EditProfileBoxQuery.graphql'
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton'
const query = graphql`
  query EditProfileBoxQuery {
    viewer {
      ...EditProfileTabs_viewer
    }
  }
`
type Props = {
  readonly languageList: Array<LocaleMap>
}
export class EditProfileBox extends Component<Props> {
  render() {
    const { languageList } = this.props

    const renderEditProfile = ({
      props,
      error,
    }: ReactRelayReadyState & {
      props: EditProfileBoxQueryResponse | null | undefined
    }) => {
      if (error) {
        return graphqlError
      }

      if (props) {
        if (props.viewer !== null) {
          return <EditProfileTabs viewer={props.viewer} languageList={languageList} />
        }
      }

      return <Loader />
    }

    return <QueryRenderer variables={{}} environment={environment} query={query} render={renderEditProfile} />
  }
}
export default EditProfileBox
