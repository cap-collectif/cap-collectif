/* eslint-env jest */

/* TODO mke a true deep jest test; testing onSubmit and onupdate */
import React from 'react'
import { shallow } from 'enzyme'
import { EventFormPage } from './EventFormPage'
import { intlMock, $refType, $fragmentRefs, formMock } from '../../../mocks'

const defaultProps = {
  ...formMock,
  intl: intlMock,
  pristine: true,
  valid: true,
  submitting: true,
  submitSucceeded: true,
  submitFailed: true,
  invalid: true,
  dispatch: jest.fn(),
  event: {
    id: 'event1',
    viewerDidAuthor: true,
    review: null,
    author: {
      id: 'auth1',
      isAdmin: true,
    },
    translations: [],
    deletedAt: null,
    creator: {
      id: 'viewerId',
    },
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
  },
  query: {
    viewer: {
      id: 'viewerId',
      isSuperAdmin: true,
      isAdmin: false,
      isOnlyProjectAdmin: false,
      isAdminOrganization: false,
      organizations: null,
    },
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
  },
  initialValues: null,
  currentLanguage: 'fr-FR',
}
describe('<EventAdminFormPage />', () => {
  it('it renders correctly, with props at true', () => {
    const props = { ...defaultProps }
    const wrapper = shallow(<EventFormPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('it renders correctly, with props at false', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      query: {
        viewer: {
          id: 'viewerId',
          isSuperAdmin: false,
          isAdmin: false,
          isOnlyProjectAdmin: false,
          isAdminOrganization: false,
          organizations: null,
        },
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
    }
    const wrapper = shallow(<EventFormPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('it renders correctly, without event', () => {
    const props = { ...defaultProps, event: null }
    const wrapper = shallow(<EventFormPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('it renders correctly, with bad date', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      event: {
        id: 'event1',
        viewerDidAuthor: true,
        review: null,
        author: {
          id: 'auth1',
          isAdmin: true,
        },
        translations: [],
        creator: {
          id: 'viewerId',
        },
        deletedAt: null,
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
      query: {
        viewer: {
          id: 'viewerId',
          isSuperAdmin: false,
          isAdmin: false,
          isOnlyProjectAdmin: false,
          isAdminOrganization: false,
          organizations: null,
        },
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
    }
    const wrapper = shallow(<EventFormPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('it renders correctly, with  registration type', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      event: {
        id: 'event1',
        viewerDidAuthor: true,
        author: {
          id: 'auth1',
          isAdmin: true,
        },
        review: null,
        translations: [],
        deletedAt: null,
        creator: {
          id: 'viewerId',
        },
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
      query: {
        viewer: {
          id: 'viewerId',
          isSuperAdmin: false,
          isAdmin: false,
          isOnlyProjectAdmin: false,
          isAdminOrganization: false,
          organizations: null,
        },
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
    }
    const wrapper = shallow(<EventFormPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('it renders correctly with translations', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      event: {
        id: 'event1',
        viewerDidAuthor: true,
        review: null,
        author: {
          id: 'auth1',
          isAdmin: true,
        },
        creator: {
          id: 'viewerId',
        },
        translations: [
          {
            locale: 'fr-FR',
            title: 'baguette',
            body: 'je mange des baguettes',
            link: 'http://baguette.fr',
            metaDescription: 'baguette',
          },
          {
            locale: 'en-GB',
            title: 'pudding',
            body: 'i eat pudding',
            link: 'http://pudding.uk',
            metaDescription: 'pudding',
          },
        ],
        deletedAt: null,
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
      query: {
        viewer: {
          id: 'viewerId',
          isSuperAdmin: false,
          isAdmin: false,
          isOnlyProjectAdmin: false,
          isAdminOrganization: false,
          organizations: null,
        },
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
    }
    const wrapper = shallow(<EventFormPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
