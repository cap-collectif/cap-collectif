import React, { Component } from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Row, Col, Tab, Nav, NavItem, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import AccountBox from './AccountBox'
import type { State, FeatureToggles } from '../../../types'
import NotificationsForm from './NotificationsForm'
import FollowingsTab from '../Following/FollowingsTab'
import type { EditProfileTabs_viewer$key } from '~relay/EditProfileTabs_viewer.graphql'
import '~relay/EditProfileTabs_viewer.graphql'
import UserAvatar from '~/components/User/UserAvatar'
import UserLink from '../UserLink'
import ChangePasswordForm from './ChangePasswordForm'
import PersonalData from './PersonalData'
import Profile from './Profile'
import ChangeUsername from './ChangeUsername'
import Media from '../../Ui/Medias/Media/Media'
import { loginWithOpenID } from '~/redux/modules/default'
import type { LocaleMap } from '@shared/language/SiteLanguageChangeButton'
import config from '~/config'
import { Text } from '@cap-collectif/ui'
import { colors } from '~/utils/colors'

type Props = {
  readonly features: FeatureToggles
  readonly loginWithOpenId: boolean
  readonly languageList: Array<LocaleMap>
  readonly viewer: EditProfileTabs_viewer$key
}
type TabKey = 'profile' | 'account' | 'personal-data' | 'password' | 'notifications' | 'followings'
export const getHashKey = (hash: string): TabKey => {
  if (hash.indexOf('profile') !== -1) {
    return 'profile'
  }

  if (hash.indexOf('account') !== -1) {
    return 'account'
  }

  if (hash.indexOf('personal-data') !== -1) {
    return 'personal-data'
  }

  if (hash.indexOf('password') !== -1) {
    return 'password'
  }

  if (hash.indexOf('notifications') !== -1) {
    return 'notifications'
  }

  if (hash.indexOf('followings') !== -1) {
    return 'followings'
  }

  return 'account'
}

const getDefaultActiveKey = (): TabKey => {
  const hash = config.canUseDOM ? window.location.hash : null

  if (hash) {
    return getHashKey(hash)
  }

  return 'profile'
}

export class EditProfileTabs extends Component<Props> {
  render() {
    const { viewer, features, loginWithOpenId, languageList } = this.props
    const viewerSsoAllowToUpdatePassword = !loginWithOpenId && viewer.hasPassword
    return (
      <Tab.Container id="account-tabs" defaultActiveKey={getDefaultActiveKey()}>
        <Row className="clearfix">
          <Col sm={4} md={3}>
            <Panel id="panel-account">
              <Panel.Heading className="d-flex">
                <Media className="m-auto align-items-center">
                  <Media.Left>
                    <UserAvatar user={viewer} />
                  </Media.Left>
                  <Media.Body>
                    <UserLink className="excerpt" user={viewer} />
                  </Media.Body>
                </Media>
              </Panel.Heading>
              <ListGroup>
                <Nav bsStyle="pills" stacked>
                  <NavItem eventKey="profile" href="#profile">
                    <ListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="icon cap-id-8" />
                      <Text as="h2" color={colors.primaryColor}><FormattedMessage id="user.profile.title"/></Text>
                    </ListGroupItem>
                  </NavItem>
                  <NavItem eventKey="account" href="#account">
                    <ListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="icon cap-setting-gear" />
                      <Text as="h2" color={colors.primaryColor}><FormattedMessage id="user.profile.edit.account"/></Text>
                    </ListGroupItem>
                  </NavItem>
                  <NavItem eventKey="personal-data" href="#personal-data">
                    <ListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="icon cap-id-1" />
                      <Text as="h2" color={colors.primaryColor}><FormattedMessage id="data"/></Text>
                    </ListGroupItem>
                  </NavItem>
                  {viewerSsoAllowToUpdatePassword && (
                    <NavItem eventKey="password" href="#password">
                      <ListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="icon cap-key-1" />
                        <Text as="h2" color={colors.primaryColor}><FormattedMessage id="global.password"/></Text>
                      </ListGroupItem>
                    </NavItem>
                  )}
                  <NavItem href="#notifications" eventKey="notifications" className="tab">
                    <ListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="icon cap-bell" />
                      <Text as="h2" color={colors.primaryColor}><FormattedMessage id="global.notifications"/></Text>
                    </ListGroupItem>
                  </NavItem>
                  <NavItem eventKey="followings" href="#followings" className="tab">
                    <ListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="icon cap-rss-2" />
                      <Text as="h2" color={colors.primaryColor}><FormattedMessage id="followings"/></Text>
                    </ListGroupItem>
                  </NavItem>
                </Nav>
              </ListGroup>
            </Panel>
          </Col>
          <Col xs={12} sm={8} md={9}>
            <Tab.Content animation>
              <Tab.Pane eventKey="profile">
                {features.profiles ? <Profile viewer={viewer} /> : <ChangeUsername viewer={viewer} />}
              </Tab.Pane>
              <Tab.Pane eventKey="account">
                <AccountBox viewer={viewer} languageList={languageList} loginWithOpenId={loginWithOpenId} />
              </Tab.Pane>
              <Tab.Pane eventKey="personal-data">
                <PersonalData viewer={viewer} />
              </Tab.Pane>
              {viewer.hasPassword && (
                <Tab.Pane eventKey="password">{!loginWithOpenId && <ChangePasswordForm viewer={viewer} />}</Tab.Pane>
              )}
              <Tab.Pane eventKey="notifications">
                <NotificationsForm viewer={viewer} />
              </Tab.Pane>
              <Tab.Pane eventKey="followings">
                <FollowingsTab viewer={viewer} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    )
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  loginWithOpenId: loginWithOpenID(state.default.ssoList),
})

// @ts-ignore
const container = connect(mapStateToProps)(EditProfileTabs)
export default createFragmentContainer(container, {
  viewer: graphql`
    fragment EditProfileTabs_viewer on User {
      hasPassword
      ...UserAvatar_user
      ...FollowingsTab_viewer
      ...NotificationsForm_viewer
      ...PersonalData_viewer
      ...Profile_viewer
      ...ChangeUsername_viewer
      ...AccountBox_viewer
      ...UserLink_user
      ...ChangePasswordForm_viewer
    }
  `,
})
