// @ts-nocheck
import React from 'react'
import ReactOnRails from 'react-on-rails'
import { ThemeProvider } from 'styled-components'
import Providers from './Providers'
import Navbar from '../components/Navbar/Navbar'
import { NavBarContextProvider } from '@shared/navbar/NavBar.context'

const NavbarAppClient = (props: Record<string, any>) => {
  const store = ReactOnRails.getStore('appStore')
  // NOTE: maybe use later global variable instead of Redux store to get theme colors
  const state = store.getState()
  const theme = {
    mainNavbarBg: state.default.parameters['color.main_menu.bg'] || '#ebebeb',
    mainNavbarBgActive: state.default.parameters['color.main_menu.bg_active'] || '#e7e7e7',
    mainNavbarText: state.default.parameters['color.main_menu.text'] || '#777',
    mainNavbarTextHover: state.default.parameters['color.main_menu.text_hover'] || '#555',
    mainNavbarTextActive: state.default.parameters['color.main_menu.text_active'] || '#555',
  }
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Providers designSystem>
      <ThemeProvider theme={theme}>
        <NavBarContextProvider>
          <Navbar {...props} theme={theme} />
        </NavBarContextProvider>
      </ThemeProvider>
    </Providers>
  )
}

export default NavbarAppClient
