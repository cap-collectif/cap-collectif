// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { DropdownButton } from 'react-bootstrap';
import { type FooterLink, type Legals } from './Footer';
import { Caret } from '../Ui/Button/SiteLanguageChangeButton';
import useShowMore from '../../utils/hooks/useShowMore';
import { useWindowWidth } from '../../utils/hooks/useWindowWidth';
import CookieManagerModal from '../StaticPage/CookieManagerModal';

type Props = {|
  links: Array<FooterLink>,
  legals: Legals,
  cookiesText: string,
  cookiesPath: string,
  privacyPath: string,
  legalPath: string,
  left?: boolean,
|};

export const LinkSeparator: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  padding: 0 8px;
  @media (max-width: 767px) {
    display: none;
  }
`;

export const LinkList: StyledComponent<{ left?: boolean }, {}, HTMLUListElement> = styled.ul`
  width: 100%;
  text-align: left;
  list-style: none;
  margin: ${props => (props.left ? '0' : 'auto')};
  padding: 0;
  display: flex;
  justify-content: ${props => !props.left && 'center'};
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
`;

const SeeMoreFooterButton: StyledComponent<{}, {}, typeof DropdownButton> = styled(DropdownButton)`
  background: transparent !important;
  border: none;
  color: inherit !important;
  font-size: inherit;
  display: flex;
  span {
    display: block;
    margin-top: -4px;
  }
  i {
    margin-top: -1px;
  }
`;

const SeeMoreLink: StyledComponent<{}, {}, HTMLLIElement> = styled.li`
  margin-bottom: 5px;
  font-size: 16px;
  a {
    color: #000 !important;
    display: flex !important;
  }
`;

const getActivatedNumber = (legals: Legals, cookiesText: string) =>
  legals.cookies + legals.privacy + legals.legal + (cookiesText ? 1 : 0);

const renderSeeMore = (
  seeMoreRef: { current: null | HTMLElement },
  handleItemWidth: () => void,
  overflowIndex: number,
  links: Array<FooterLink>,
) => {
  return (
    <li key="see-more-footer" ref={seeMoreRef}>
      <LinkSeparator>|</LinkSeparator>
      <SeeMoreFooterButton
        id="footer-see-more-button"
        noCaret
        dropup
        pullRight
        title={
          <>
            <FormattedMessage id="global.navbar.see_more" />
            <Caret className="cap-arrow-39" color="inherit" />
          </>
        }>
        {links.map((link: FooterLink, index: number) => {
          return index >= overflowIndex ? (
            <SeeMoreLink key={link.name} ref={handleItemWidth}>
              <a href={link.url}>{link.name}</a>
            </SeeMoreLink>
          ) : null;
        })}
      </SeeMoreFooterButton>
    </li>
  );
};

const FooterLinksRender = ({
  links,
  legals,
  cookiesPath,
  privacyPath,
  legalPath,
  cookiesText,
  left = false,
}: Props) => {
  const activeNumber = getActivatedNumber(legals, cookiesText);
  const { width } = useWindowWidth();
  const [
    containerRef,
    seeMoreRef,
    handleItemWidth,
    overflowIndex,
    shouldDisplaySeeMore,
  ] = useShowMore(width > 767, (links && links.length + activeNumber) || 0);
  return (
    <LinkList ref={containerRef}>
      {legals.cookies && (
        <li ref={handleItemWidth}>
          <a href={cookiesPath}>
            <FormattedMessage id="cookies" />
          </a>
        </li>
      )}
      {legals.privacy && (
        <li ref={handleItemWidth} left={left}>
          <LinkSeparator>|</LinkSeparator>
          <a href={privacyPath}>
            <FormattedMessage id="privacy-policy" />
          </a>
        </li>
      )}
      {legals.legal && (
        <li ref={handleItemWidth}>
          <LinkSeparator>|</LinkSeparator>
          <a href={legalPath}>
            <FormattedMessage id="legal-mentions" />
          </a>
        </li>
      )}
      {cookiesText && (
        <li ref={handleItemWidth}>
          <CookieManagerModal bannerTrad={cookiesText} isLink separator="|" />
        </li>
      )}
      {links.map((link: FooterLink, index: number) =>
        index < overflowIndex - activeNumber ? (
          <li key={link.name} ref={handleItemWidth}>
            {!index && legals.legal && <LinkSeparator>|</LinkSeparator>}
            <a href={link.url}>{link.name}</a>
            {index < overflowIndex - activeNumber - 1 && <LinkSeparator>|</LinkSeparator>}
          </li>
        ) : null,
      )}
      {shouldDisplaySeeMore &&
        renderSeeMore(seeMoreRef, handleItemWidth, overflowIndex - activeNumber, links)}
    </LinkList>
  );
};

export default FooterLinksRender;
