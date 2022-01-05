// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { type GlobalState, type FeatureToggles } from '~/types';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Accordion from '~ds/Accordion';
import SidebarButton from './SidebarButton';
import SidebarLink from './SidebarLink';
import { ICON_NAME } from '~ds/Icon/Icon';
import { pxToRem } from '~/utils/styles/mixins';
import colors from '~/styles/modules/colors';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import useIsMobile from '~/utils/hooks/useIsMobile';
import { URL_MAP, CAP_COLLECTIF_SVG } from './Sidebar.utils';

export type Props = {| +appVersion: string, +defaultAccordeon?: string |};

const SidebarAccordionItem = styled(Accordion.Item).attrs({ bg: 'gray.900', pb: 0 })``;
const SidebarAccordionPanel = styled(Accordion.Panel).attrs(({ isFirstRender, isOpen }) => ({
  bg: 'gray.800',
  pb: 2,
  transition: { duration: isFirstRender ? 0 : 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
  display: `${isOpen ? 'flex' : 'none'} !important`,
}))``;

const cookieName = 'sidebar_is_opened';

export const Sidebar = ({ appVersion, defaultAccordeon }: Props): React.Node => {
  const savedIsOpen = localStorage.getItem(cookieName);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState<boolean>(
    savedIsOpen ? savedIsOpen === 'true' : !isMobile,
  );
  const [isFirstRender, setIsFirstRender] = React.useState<boolean>(true);
  const intl = useIntl();
  const features: FeatureToggles = useSelector((state: GlobalState) => state.default.features);
  const user = useSelector((state: GlobalState) => state.user.user);
  const isAdmin = user ? user.isAdmin : false;
  const isProjectAdmin = user ? user.isProjectAdmin : false;
  let defaultAccordion = defaultAccordeon || '';
  if (!defaultAccordeon) {
    const keys = Object.keys(URL_MAP);
    for (const key of keys) {
      if (URL_MAP[key].some(val => window.location.href.includes(val))) defaultAccordion = key;
    }
  }
  React.useEffect(() => {
    const sonataNavbar = document.querySelector('nav.navbar.navbar-static-top');
    const sonataContent = document.querySelector('.content-admin');
    if (sonataNavbar && sonataContent && !isMobile) {
      sonataNavbar.style.marginLeft = !isOpen ? '56px' : '230px';
      sonataContent.style.width = !isOpen ? 'calc(100vw - 56px)' : 'calc(100vw - 224px)';
    }
    setIsFirstRender(false);
    // we only want this on our first render
    // eslint-disable-next-line
  }, []);
  return (
    <AppBox
      as="aside"
      bg="gray.900"
      width={pxToRem(isOpen ? 224 : 56)}
      // Don't ask me why, Sonata
      css={{ transition: 'width 0.3s ease-in-out', zIndex: 1031 }}
      height={isMobile && !isOpen ? '56px' : '100%'}
      position={isMobile ? 'absolute' : 'unset'}>
      <AppBox
        position={isMobile ? 'absolute' : 'fixed'}
        top={0}
        left={0}
        bg={isMobile && !isOpen ? 'white' : 'gray.900'}
        overflow="hidden"
        height="100%"
        width={pxToRem(isOpen ? 224 : 56)}
        onMouseEnter={() => {
          const sonataNavbar = document.querySelector('nav.navbar.navbar-static-top');
          const sonataContent = document.querySelector('.content-admin');
          if (!isOpen) {
            if (sonataNavbar && !isMobile) sonataNavbar.style.marginLeft = '230px';
            if (sonataContent && !isMobile) sonataContent.style.width = 'calc(100vw - 224px)';
            localStorage.setItem(cookieName, 'true');
            setIsOpen(true);
          }
        }}
        css={{ transition: 'width 0.3s ease-in-out', zIndex: 1031 }}>
        <Flex
          boxShadow="0px 4px 13px rgb(0 0 0 / 20%);"
          p={4}
          justifyContent="space-between"
          position="relative">
          <a href="/" style={{ overflow: 'hidden' }}>
            {CAP_COLLECTIF_SVG}
          </a>
          <Button
            onClick={() => {
              const sonataNavbar = document.querySelector('nav.navbar.navbar-static-top');
              const sonataContent = document.querySelector('.content-admin');
              if (sonataNavbar && sonataContent && !isMobile) {
                sonataNavbar.style.marginLeft = isOpen ? '56px' : '230px';
                sonataContent.style.width = isOpen ? 'calc(100vw - 56px)' : 'calc(100vw - 224px)';
              }
              localStorage.setItem(cookieName, isOpen ? 'false' : 'true');
              setIsOpen(!isOpen);
            }}>
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 8.33333H19"
                stroke={isMobile && !isOpen ? colors.blue[900] : '#FAFCFF'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12.3334H19"
                stroke={isMobile && !isOpen ? colors.blue[900] : '#FAFCFF'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 16.3334H19"
                stroke={isMobile && !isOpen ? colors.blue[900] : '#FAFCFF'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </Flex>

        <Flex
          direction="column"
          height="calc(100% - 105px)"
          css={{
            overflowY: 'scroll',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}>
          <Accordion spacing={0} defaultAccordion={defaultAccordion}>
            {isAdmin ? (
              <SidebarAccordionItem id="contributions">
                <SidebarButton
                  icon={ICON_NAME.PENCIL_O}
                  text="global.contribution"
                  isOpen={isOpen}
                />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  {features.reporting && (
                    <SidebarLink text="admin.label.reporting" href="/admin/reporting" />
                  )}
                  <SidebarLink text="admin.label.proposal" href="/admin/capco/app/proposal/list" />
                  <SidebarLink text="admin.label.opinion" href="/admin/capco/app/opinion/list" />
                  <SidebarLink
                    text="admin.label.opinion_version"
                    href="/admin/capco/app/opinionversion/list"
                  />
                  <SidebarLink text="admin.label.argument" href="/admin/capco/app/argument/list" />
                  <SidebarLink text="admin.label.source" href="/admin/capco/app/source/list" />
                  <SidebarLink text="admin.label.comment" href="/admin/capco/app/comment/list" />
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
            {isAdmin || isProjectAdmin ? (
              <SidebarAccordionItem id="contenus">
                <SidebarButton
                  icon={ICON_NAME.FOLDER_O}
                  text="admin.group.content"
                  isOpen={isOpen}
                />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  {isAdmin && (
                    <SidebarLink
                      text="admin.label.highlighted"
                      href="/admin/capco/app/highlightedcontent/list"
                    />
                  )}
                  {isAdmin && (
                    <SidebarLink text="admin.label.theme" href="/admin/capco/app/theme/list" />
                  )}
                  {(isAdmin || isProjectAdmin) && (
                    <SidebarLink text="admin.label.post" href="/admin/capco/app/post/list" />
                  )}
                  {features.calendar && (
                    <SidebarLink text="admin.label.events" href="/admin/capco/app/event/list" />
                  )}
                  {isAdmin && (
                    <SidebarLink text="admin.label.video" href="/admin/capco/app/video/list" />
                  )}
                  {isAdmin && (
                    <SidebarLink text="admin.label.page" href="/admin/capco/app/page/list" />
                  )}
                  {isAdmin && <SidebarLink text="media" href="/admin/capco/media/media/list" />}
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
            {isAdmin || isProjectAdmin ? (
              <SidebarAccordionItem id="projets">
                <SidebarButton
                  icon={ICON_NAME.BOOK_STAR_O}
                  text="admin.group.project"
                  isOpen={isOpen}
                />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  <SidebarLink text="admin.label.project" href="/admin/capco/app/project/list" />
                  {isAdmin ? (
                    <SidebarLink
                      text="admin.label.appendix"
                      href="/admin/capco/app/appendixtype/list"
                    />
                  ) : null}
                  {isAdmin ? (
                    <SidebarLink
                      text="admin.label.category"
                      href="/admin/capco/app/sourcecategory/list"
                    />
                  ) : null}
                  {isAdmin ? (
                    <SidebarLink
                      text="admin.label.consultation"
                      href="/admin/capco/app/consultation/list"
                    />
                  ) : null}
                  <SidebarLink
                    text="admin.label.proposal_form"
                    href="/admin/capco/app/proposalform/list"
                  />
                  <SidebarLink
                    text="admin.label.questionnaire"
                    href="/admin/capco/app/questionnaire/list"
                  />
                  {isAdmin ? (
                    <SidebarLink
                      text="admin.label.pages.types"
                      href="/admin/capco/app/projecttype/list"
                    />
                  ) : null}
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
            {isAdmin ? (
              <SidebarAccordionItem id="utilisateurs">
                <SidebarButton
                  icon={ICON_NAME.USER_O}
                  text="sonata.admin.group.user"
                  isOpen={isOpen}
                />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  <SidebarLink text="global.select_user.type" href="/admin/capco/user/user/list" />
                  <SidebarLink
                    text="admin-menu-invite-users-label"
                    href="/admin/capco/user/invite/list"
                  />
                  <SidebarLink text="admin.label.group" href="/admin/capco/app/group/list" />
                  <SidebarLink
                    text="admin.label.user_type"
                    href="/admin/capco/user/usertype/list"
                  />
                  <SidebarLink
                    text="admin.label.newsletter_subscription"
                    href="/admin/capco/app/newslettersubscription/list"
                  />
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
            {isAdmin ? (
              <SidebarAccordionItem id="reglages">
                <SidebarButton
                  icon={ICON_NAME.COG_O}
                  text="admin.group.parameters"
                  isOpen={isOpen}
                />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  <SidebarLink text="admin.label.menu_item" href="/admin/capco/app/menuitem/list" />
                  <SidebarLink
                    text="admin.label.social_network"
                    href="/admin/capco/app/socialnetwork/list"
                  />
                  <SidebarLink
                    text="admin.label.footer_social_network"
                    href="/admin/capco/app/footersocialnetwork/list"
                  />
                  <SidebarLink
                    text="admin.label.project_district"
                    href="/admin/capco/app/district-projectdistrict/list"
                  />
                  <SidebarLink text="admin.fields.proposal_form.map" href="/admin/map/list" />
                  {features.multilangue && (
                    <SidebarLink text="global-languages" href="/admin/locale/list" />
                  )}
                  {features.http_redirects && (
                    <SidebarLink text="custom-url" href="/admin/redirect/list" />
                  )}
                  <SidebarLink text="website-icon" href="/admin/favicon/list" />
                  <SidebarLink text="global-typeface" href="/admin/font/list" />
                  <SidebarLink
                    text="admin.label.settings.global"
                    href="/admin/settings/settings.global/list"
                  />
                  <SidebarLink
                    text="admin.label.settings.performance"
                    href="/admin/settings/settings.performance/list"
                  />
                  <SidebarLink
                    text="admin.label.settings.modules"
                    href="/admin/settings/settings.modules/list"
                  />
                  {(!features.beta__emailing ||
                    (features.beta__emailing && !features.beta__emailing_parameters)) && (
                    <SidebarLink
                      text="admin.label.settings.notifications"
                      href="/admin/settings/settings.notifications/list"
                    />
                  )}
                  <SidebarLink
                    text="admin.label.settings.appearance"
                    href="/admin/settings/settings.appearance/list"
                  />
                  <SidebarLink
                    text="secured-participation"
                    href="/admin-next/identificationCodes"
                  />
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
            {isAdmin ? (
              <SidebarAccordionItem id="pages">
                <SidebarButton icon={ICON_NAME.FILE_O} text="admin.group.pages" isOpen={isOpen} />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  <SidebarLink text="admin.label.section" href="/admin/capco/app/section/list" />
                  <SidebarLink text="admin.label.pages.contact" href="/admin/contact/list" />
                  <SidebarLink
                    text="admin.label.pages.homepage"
                    href="/admin/settings/pages.homepage/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.blog"
                    href="/admin/settings/pages.blog/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.events"
                    href="/admin/settings/pages.events/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.themes"
                    href="/admin/settings/pages.themes/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.projects"
                    href="/admin/settings/pages.projects/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.registration"
                    href="/admin/settings/pages.registration/list"
                  />
                  {features.members_list && (
                    <SidebarLink
                      text="admin.label.pages.members"
                      href="/admin/settings/pages.members/list"
                    />
                  )}
                  <SidebarLink
                    text="admin.label.pages.login"
                    href="/admin/settings/pages.login/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.footer"
                    href="/admin/settings/pages.footer/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.cookies"
                    href="/admin/settings/pages.cookies/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.privacy"
                    href="/admin/settings/pages.privacy/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.legal"
                    href="/admin/settings/pages.legal/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.charter"
                    href="/admin/settings/pages.charter/list"
                  />
                  <SidebarLink
                    text="admin.label.pages.shield"
                    href="/admin/settings/pages.shield/list"
                  />
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
            {features.beta__emailing ? (
              <SidebarAccordionItem id="emailing">
                <SidebarButton
                  icon={ICON_NAME.ENVELOPE_O}
                  text="admin.group.emailing"
                  isOpen={isOpen}
                />
                <SidebarAccordionPanel isOpen={isOpen} isFirstRender={isFirstRender}>
                  <SidebarLink text="admin-menu-campaign-list" href="/admin/mailingCampaign/list" />
                  <SidebarLink text="admin-menu-emailing-list" href="/admin/mailingList/list" />
                  {features.beta__emailing_parameters && isAdmin ? (
                    <SidebarLink
                      text="admin-menu-parameters"
                      href="/admin/mailingParameters/list"
                    />
                  ) : null}
                </SidebarAccordionPanel>
              </SidebarAccordionItem>
            ) : null}
          </Accordion>

          {features.beta__analytics_page ? (
            <SidebarLink
              text="admin.label.analytics"
              href="/admin/capco/analytics/list"
              icon="PIE_CHART"
              withLabel={isOpen}
              fontSize={3}
              p={3}
              width="100%"
              beta
            />
          ) : null}
        </Flex>

        {isOpen && (
          <Text
            as="span"
            color="gray.700"
            position="absolute"
            bottom={5}
            fontSize={11}
            textAlign="center"
            width="100%">
            {`${intl.formatMessage({ id: 'app-version' })} ${appVersion}`}
          </Text>
        )}
      </AppBox>
    </AppBox>
  );
};

export default Sidebar;
