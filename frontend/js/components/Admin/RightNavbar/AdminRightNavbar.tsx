import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'

import styled from 'styled-components'
import { connect } from 'react-redux'
import UserBlockProfile from '../../Ui/BackOffice/UserBlockProfile'
import EarthIcon from '../../Ui/Icons/EarthIcon'
import type { AdminRightNavbar_query } from '~relay/AdminRightNavbar_query.graphql'
import type { FeatureToggles, GlobalState } from '~/types'
import colors from '../../../utils/colors'
import CookieMonster from '~/CookieMonster'
import Menu from '~ds//Menu/Menu'
import Button from '~ds/Button/Button'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import { formatCodeToLocale } from '~/utils/locale-helper'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import UpdateLocaleMutation from '~/mutations/UpdateLocaleMutation'

export type Props = {
  query: AdminRightNavbar_query
  features: FeatureToggles
  currentLocale: string
  isUsingDesignSystem?: boolean
}
const Navbar = styled.ul`
  right: 0;
  position: absolute;
  list-style: none;

  #admin-beamer-navbar + ul {
    display: none;
  }
`
const CustomNavbarItem = styled(Button)`
  position: relative;
  float: left;
  height: 56px;
  width: 55px;
  border-left: 1px solid ${colors.borderColor};
  padding: 8px;
`
const Placeholder = styled.div`
  width: 24px;
`

const AdminRightNavbar = ({ currentLocale, features, query, isUsingDesignSystem }: Props) => {
  const isMultiLocaleEnabled = useFeatureFlag('multilangue')
  const locales =
    query.availableLocales.map(locale => {
      const formattedLocale = formatCodeToLocale(locale.code)
      return {
        locale: formattedLocale,
        path: `/locale/${formattedLocale}`,
      }
    }) ?? []
  return (
    <Navbar>
      <CustomNavbarItem id="admin-beamer-navbar">
        <div className="dropdown-toggle js-notifications-trigger beamerTrigger ml-5" data-toggle="dropdown">
          <i className="fa fa-bell fa-fw" aria-hidden="true" />
        </div>
      </CustomNavbarItem>
      {features.multilangue && (
        <Menu placement="bottom-start" as="li">
          <Menu.Button>
            <CustomNavbarItem
              id="admin-multilangue-dropdown-navbar"
              rightIcon={
                <Icon
                  name={ICON_NAME.ARROW_DOWN_O}
                  size={isUsingDesignSystem ? ICON_SIZE.XS : ICON_SIZE.SM}
                  color={colors.black}
                />
              }
              variant="tertiary"
              variantSize="small"
              variantColor="hierarchy"
            >
              <EarthIcon color={colors.black} />
            </CustomNavbarItem>
          </Menu.Button>
          <Menu.List id="admin-multilangue-dropdown">
            {locales &&
              isMultiLocaleEnabled &&
              locales.map(localeData => (
                <Menu.ListItem
                  style={{
                    color: colors.black,
                    paddingLeft: '10px',
                    textDecoration: 'none',
                  }}
                  as="a"
                  key={localeData.locale}
                  onClick={() => {
                    const formattedLocale = localeData.locale
                    UpdateLocaleMutation.commit({
                      input: {
                        locale: formattedLocale,
                      },
                    }).then(() => {
                      CookieMonster.setLocale(formattedLocale)
                      window.location.reload()
                    })
                  }}
                >
                  {localeData.locale === currentLocale ? <i className="cap-android-done mr-10" /> : <Placeholder />}
                  <span
                    style={{
                      marginLeft: '5px',
                    }}
                  >
                    {localeData.locale}
                  </span>
                </Menu.ListItem>
              ))}
          </Menu.List>
        </Menu>
      )}
      <Menu placement="bottom-start" as="li">
        <Menu.Button id="admin-profile-dropdown-navbar">
          <CustomNavbarItem
            rightIcon={
              <Icon
                name={ICON_NAME.ARROW_DOWN_O}
                size={isUsingDesignSystem ? ICON_SIZE.XS : ICON_SIZE.SM}
                color={colors.black}
              />
            }
            variant="tertiary"
            variantSize="small"
            variantColor="hierarchy"
          >
            <Icon
              name={ICON_NAME.USER}
              size={isUsingDesignSystem ? ICON_SIZE.XS : ICON_SIZE.SM}
              color="#000 !important"
            />
          </CustomNavbarItem>
        </Menu.Button>
        <Menu.List>
          <UserBlockProfile query={query} />
        </Menu.List>
      </Menu>
    </Navbar>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
})

export default createFragmentContainer(connect(mapStateToProps)(AdminRightNavbar), {
  query: graphql`
    fragment AdminRightNavbar_query on Query {
      ...UserBlockProfile_query
      availableLocales(includeDisabled: false) {
        code
      }
    }
  `,
})
