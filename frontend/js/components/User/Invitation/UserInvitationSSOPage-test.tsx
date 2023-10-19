/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest, MockProviders } from '~/testUtils'
import type { UserInvitationSSOPageTestQuery } from '~relay/UserInvitationSSOPageTestQuery.graphql'
import UserInvitationSSOPage from './UserInvitationSSOPage'

describe('<UserInvitationSSOPage />', () => {
  let environment
  let testComponentTree
  let TestUserInvitationSSOPage
  const query = graphql`
    query UserInvitationSSOPageTestQuery @relay_test_operation {
      siteImage(keyname: "image.logo") {
        ...UserInvitationSSOPage_logo
      }
    }
  `
  const defaultMockResolvers = {
    SiteImage: () => ({
      media: {
        url: '/logo',
      },
    }),
  }
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<UserInvitationSSOPageTestQuery>(query, variables)

      if (data?.siteImage) {
        return <UserInvitationSSOPage logoFragmentRef={data.siteImage} {...componentProps} />
      }

      return null
    }

    TestUserInvitationSSOPage = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders store={{}}>
          <TestRenderer componentProps={componentProps} queryVariables={{}} />
        </MockProviders>
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  const props = {
    loginFacebook: false,
    loginFranceConnect: false,
    ssoList: [],
    isRegistrationAllowed: true,
    primaryColor: 'green',
    btnTextColor: 'white',
    backgroundColor: 'white',
    setFirstVisited: jest.fn(),
    token: 'onishan',
  }
  describe('<TestUserInvitationSSOPage />', () => {
    it('should render facebook sso button', () => {
      testComponentTree = ReactTestRenderer.create(<TestUserInvitationSSOPage {...props} loginFacebook />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render franceConnect sso button', () => {
      testComponentTree = ReactTestRenderer.create(<TestUserInvitationSSOPage {...props} loginFranceConnect />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
