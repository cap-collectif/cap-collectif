import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import type { FooterLink, Legals } from './Footer'
import useShowMore from '@shared/hooks/useShowMore'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'
import CookieManagerModal from '../StaticPage/CookieManagerModal'
import colors from '~/styles/modules/colors'
import { Menu, Button, CapUIIcon } from '@cap-collectif/ui'

type Props = {
  links: Array<FooterLink>
  legals: Legals
  cookiesText: string
  cookiesPath: string
  privacyPath: string
  legalPath: string
  left?: boolean
}
export const LinkSeparator = styled.span`
  padding: 0 8px;
  @media (max-width: 767px) {
    display: none;
  }
`
export const LinkList = styled.ul<{
  left?: boolean
}>`
  width: 100%;
  text-align: left;
  list-style: none;
  margin: ${props => (props.left ? '0' : 'auto')};
  padding: 0;
  display: flex;
  justify-content: ${props => (!props.left ? 'center' : undefined)};
  flex-wrap: wrap;
  a {
    color: inherit;
  }
  @media (max-width: 767px) {
    text-align: center;
    flex-direction: column;
    li {
      padding-bottom: 5px;
    }
  }
`
const SeeMoreFooterButton = styled(Button)`
  background: transparent !important;
  border: none;
  color: inherit !important;
  font-size: inherit;
  display: flex;
  &:focus {
    box-shadow: none !important;
  }
  span {
    display: block;
    margin-top: -4px;
  }
  i {
    margin-top: -1px;
  }
`

const getActivatedNumber = (legals: Legals, cookiesText: string) =>
  // @ts-ignore
  legals.cookies + legals.privacy + legals.legal + (cookiesText ? 1 : 0)

const renderSeeMore = (
  seeMoreRef: {
    current: null | HTMLLIElement
  },
  handleItemWidth: () => void,
  overflowIndex: number,
  links: Array<FooterLink>,
) => {
  return (
    <li key="see-more-footer" ref={seeMoreRef}>
      <LinkSeparator>|</LinkSeparator>
      <Menu
        disclosure={
          <SeeMoreFooterButton
            padding={0}
            id="footer-see-more-button"
            rightIcon={CapUIIcon.ArrowDownO}
            variant="primary"
            variantSize="small"
          >
            <FormattedMessage id="global.navbar.see_more" />
          </SeeMoreFooterButton>
        }
      >
        <Menu.List>
          {links.map((link: FooterLink, index: number) => {
            return index >= overflowIndex ? (
              <Menu.Item
                style={{
                  color: colors.black,
                }}
                as="a"
                href={link.url}
                key={link.name}
                ref={handleItemWidth}
              >
                {link.name}
              </Menu.Item>
            ) : null
          })}
        </Menu.List>
      </Menu>
    </li>
  )
}

const FooterLinksRender = ({
  links,
  legals,
  cookiesPath,
  privacyPath,
  legalPath,
  cookiesText,
  left = false,
}: Props) => {
  const activeNumber = getActivatedNumber(legals, cookiesText)
  const { width } = useWindowWidth()
  const [containerRef, seeMoreRef, handleItemWidth, overflowIndex, shouldDisplaySeeMore] = useShowMore(
    width > 767,
    (links && links.length + activeNumber) || 0,
  )
  return (
    <LinkList ref={containerRef}>
      {legals.cookies && (
        <li ref={handleItemWidth}>
          <a href={cookiesPath}>
            <FormattedMessage id="cookies" />
          </a>
        </li>
      )}
      <li ref={handleItemWidth}>
        <CookieManagerModal isLink separator={legals.cookies || legals.privacy || legals.legal ? '|' : ''} />
      </li>
      {legals.privacy && (
        <li ref={handleItemWidth} left={left}>
          {legals.cookies && <LinkSeparator>|</LinkSeparator>}
          <a href={privacyPath}>
            <FormattedMessage id="privacy-policy" />
          </a>
        </li>
      )}
      {legals.legal && (
        <li ref={handleItemWidth}>
          {(legals.privacy || legals.cookies) && <LinkSeparator>|</LinkSeparator>}
          <a href={legalPath}>
            <FormattedMessage id="legal-mentions" />
          </a>
        </li>
      )}
      {links.map((link: FooterLink, index: number) =>
        index < overflowIndex - activeNumber ? (
          <li key={link.name} ref={handleItemWidth}>
            {!index && (legals.legal || legals.privacy || legals.cookies || cookiesText) && (
              <LinkSeparator>|</LinkSeparator>
            )}
            <a href={link.url}>{link.name}</a>
            {index < overflowIndex - activeNumber - 1 && <LinkSeparator>|</LinkSeparator>}
          </li>
        ) : null,
      )}
      {shouldDisplaySeeMore && renderSeeMore(seeMoreRef, handleItemWidth, overflowIndex - activeNumber, links)}
    </LinkList>
  )
}

export default FooterLinksRender
