/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EditProfileTabs, getHashKey } from './EditProfileTabs'
import { features } from '../../../redux/modules/default'
import { $fragmentRefs, $refType } from '../../../mocks'
import { mockUrl } from '~/testUtils'

describe('<EditProfileTabs />', () => {
  const globalProps = {
    languageList: [
      {
        translationKey: 'french',
        code: 'fr-FR',
      },
      {
        translationKey: 'english',
        code: 'en-GB',
      },
      {
        translationKey: 'deutsch',
        code: 'de-DE',
      },
    ],
    viewer: {
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      hasPassword: true,
    },
  }
  const propsWithoutParis = {
    features: { ...features, profiles: true },
    loginWithOpenId: false,
  }
  const propsWithOpenIdAndNotProfiles = {
    features: { ...features, profiles: false },
    loginWithOpenId: true,
  }
  afterEach(() => {
    mockUrl('http://localhost')
  })
  /**
   * @jest-status legacy
   * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
   * public DOM behavior.
   */
  it('should render all tabs', () => {
    const wrapper = shallow(<EditProfileTabs {...propsWithoutParis} {...globalProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  /**
   * @jest-status legacy
   * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
   * public DOM behavior.
   */
  it('should render all tabs except profile, password and account (OpenID)', () => {
    const wrapper = shallow(<EditProfileTabs {...propsWithOpenIdAndNotProfiles} {...globalProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return profile from hashkey', () => {
    const result = getHashKey('profile')
    expect(result).toEqual('profile')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return password from hashkey', () => {
    const result = getHashKey('password')
    expect(result).toEqual('password')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return personal-data from hashkey', () => {
    const result = getHashKey('personal-data')
    expect(result).toEqual('personal-data')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return account from hashkey', () => {
    const result = getHashKey('account')
    expect(result).toEqual('account')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return notifications from hashkey', () => {
    const result = getHashKey('notifications')
    expect(result).toEqual('notifications')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return followings from hashkey', () => {
    const result = getHashKey('followings')
    expect(result).toEqual('followings')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
   */
  it('should return account from empty hashkey', () => {
    const result = getHashKey('')
    expect(result).toEqual('account')
  })
})
