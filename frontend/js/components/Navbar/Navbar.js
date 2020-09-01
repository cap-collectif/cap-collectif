/* @flow */
import React, { useState, useRef, type Element } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import { graphql, QueryRenderer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { connect } from 'react-redux';
import TabsBar from '../Ui/TabsBar/TabsBar';
import NavigationSkip from './NavigationSkip';
import NavbarToggle from './NavbarToggle';
import * as S from './styles';
import LoginModal from '~/components/User/Login/LoginModal';
import RegistrationModal from '~/components/User/Registration/RegistrationModal';
import LanguageHeader from '~/components/Navbar/LanguageHeader';
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton';
import type { Dispatch, GlobalState } from '~/types';
import { useBoundingRect } from '~/utils/hooks/useBoundingRect';
import { useEventListener } from '~/utils/hooks/useEventListener';
import type { LocaleChoiceTranslation } from '~/components/Navbar/LanguageHeader';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { NavbarQueryResponse } from '~relay/NavbarQuery.graphql';

type LanguageProps = {|
  currentRouteParams: [],
  currentRouteName: string,
  preferredLanguage: string,
  currentLanguage: string,
  +localeChoiceTranslations: Array<LocaleChoiceTranslation>,
  languageList: Array<LocaleMap>,
|};

export type Props = {|
  home: string,
  intl: IntlShape,
  logo?: ?string,
  items: Array<Object>,
  siteName: ?string,
  contentRight?: Element<Object>,
  isMultilangueEnabled: boolean,
  ...LanguageProps,
|};

const HeaderContainer: StyledComponent<
  { isLanguageHeaderVisible: boolean, height: number },
  {},
  HTMLDivElement,
> = styled('div')`
  margin-bottom: ${props => (props.isLanguageHeaderVisible ? `${props.height}px` : '0')};
`;

export const Navbar = ({
  home,
  logo,
  items,
  intl,
  siteName,
  contentRight,
  languageList,
  currentLanguage,
  preferredLanguage,
  currentRouteName,
  currentRouteParams,
  isMultilangueEnabled,
  localeChoiceTranslations,
  ...rest
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isLocaleHeaderVisible, setLocaleHeaderVisible] = useState(true);
  const ref = useRef();
  const rect = useBoundingRect(ref);

  const setAriaExpanded = () => {
    setExpanded(!expanded);
  };

  const handleResize = () => {
    setDesktop(window.matchMedia('(min-width: 768px)').matches);
  };

  const handleLoading = () => {
    setLogoLoaded(true);
  };

  const renderRegistrationForm = ({
    error,
    props,
  }: {
    ...ReactRelayReadyState,
    props: ?NavbarQueryResponse,
  }) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }

    if (props) return <RegistrationModal query={props} locale={currentLanguage} />;

    return null;
  };

  useEventListener('resize', handleResize);

  return (
    <HeaderContainer isLanguageHeaderVisible={isLocaleHeaderVisible} height={rect.height}>
      <div id="main-navbar" className="navbar-fixed-top">
        <div>
          <React.Fragment>
            {isMultilangueEnabled &&
            setLocaleHeaderVisible &&
            preferredLanguage !== currentLanguage ? (
              <LanguageHeader
                innerRef={ref}
                {...rest}
                currentRouteName={currentRouteName}
                currentRouteParams={currentRouteParams}
                onHeaderClose={() => {
                  setLocaleHeaderVisible(false);
                }}
                preferredLanguage={preferredLanguage}
                currentLanguage={currentLanguage}
                localeChoiceTranslations={localeChoiceTranslations}
                languageList={languageList}
              />
            ) : null}
            <div className="container">
              <QueryRenderer
                environment={environment}
                query={graphql`
                  query NavbarQuery {
                    ...RegistrationModal_query
                  }
                `}
                variables={{}}
                render={renderRegistrationForm}
            />

              <LoginModal />
              <NavigationSkip />
              <S.NavigationContainer id="main-navbar" role="navigation">
                <S.NavigationHeader>
                  {logo && (
                    <S.Brand id="brand">
                      <a href={home} title={intl.formatMessage({ id: 'navbar.homepage' })}>
                        <img
                          src={logo}
                          alt={siteName}
                          onLoad={handleLoading}
                          onError={handleLoading}
                        />
                      </a>
                    </S.Brand>
                  )}
                </S.NavigationHeader>
                <NavbarToggle onClick={setAriaExpanded} expanded={expanded} />
                {desktop && logoLoaded && (
                  <S.NavigationContentDesktop>
                    {items.length > 0 && <TabsBar items={items} />}
                    {contentRight && (
                      <S.NavigationContentRight>{contentRight}</S.NavigationContentRight>
                    )}
                  </S.NavigationContentDesktop>
                )}
                {expanded && (
                  <S.NavigationContentMobile>
                    {items.length > 0 && <TabsBar items={items} vertical />}
                    {contentRight && (
                      <S.NavigationContentRight vertical>
                        {React.cloneElement(contentRight, { vertical: true })}
                      </S.NavigationContentRight>
                    )}
                  </S.NavigationContentMobile>
                )}
              </S.NavigationContainer>
            </div>
          </React.Fragment>
        </div>
      </div>
    </HeaderContainer>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    dispatch,
  };
};

const mapStateToProps = (state: GlobalState) => {
  return {
    isLocaleHeaderVisible: state.user.showLocaleHeader || true,
    isMultilangueEnabled: state.default.features.multilangue,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Navbar));
