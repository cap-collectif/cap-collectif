import * as React from 'react';
import NavBar, { NavBarProps } from '../NavBar/NavBar';
import SideBar, { setSideBarCookie, SIDE_BAR_COOKIE } from '../SideBar/SideBar';
import { useIntl } from 'react-intl';
import { Box, Flex } from '@cap-collectif/ui';
import Head from 'next/head';
import NavBarPlaceholder from '../NavBar/NavBarPlaceholder';
import { NavBarProvider } from '../NavBar/NavBar.context';
import { useAppContext } from '../AppProvider/App.context';
import { FONT_PATH } from '../../styles/Fonts';
import { SideBarProvider } from '@ui/SideBar/SideBar.context';
import sideBarItems from '../SideBar/SideBarItems.json';
import { useRouter } from 'next/router';
import CookieHelper from '@utils/cookie-helper';
import { LayoutProvider } from './Layout.context';
import useFeatureFlag from '@hooks/useFeatureFlag';

export interface LayoutProps {
    children: React.ReactNode;
    navTitle: NavBarProps['title'];
    navData?: NavBarProps['data'];
    title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, navTitle, navData, title }) => {
    const intl = useIntl();
    const contentRef = React.useRef(null);
    const { viewerSession } = useAppContext();
    const { pathname } = useRouter();
    const helpscoutBeacon = useFeatureFlag('helpscout_beacon');
    const menuOpen = sideBarItems.find(sideBarItem => {
        if (sideBarItem.items.length > 0)
            return sideBarItem.items.some(item => item.href.includes(pathname));
    });
    const defaultSideBarFold = CookieHelper.getCookie(SIDE_BAR_COOKIE);

    return (
        <NavBarProvider>
            <SideBarProvider
                defaultMenuOpen={menuOpen ? menuOpen.id : null}
                defaultFold={
                    typeof defaultSideBarFold === 'undefined' ? true : defaultSideBarFold === 'true'
                }
                onFold={fold => {
                    setSideBarCookie(fold);
                }}>
                <Head>
                    <title>{title || intl.formatMessage({ id: 'global.administration' })}</title>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                            var beamer_config = {
                                product_id: 'isibNKBX16208',
                                user_firstname: '${viewerSession.username}',
                                user_email: '${viewerSession.email}',
                            }`,
                        }}
                    />
                    <script
                        type="text/javascript"
                        src="https://app.getbeamer.com/js/beamer-embed.js"
                        defer
                    />
                    {helpscoutBeacon && (
                        <>
                            <script
                                type="text/javascript"
                                dangerouslySetInnerHTML={{
                                    __html: `!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`,
                                }}
                            />
                            <script
                                type="text/javascript"
                                dangerouslySetInnerHTML={{
                                    __html: `
                            window.Beacon('logout', { endActiveChat: true });
                            window.Beacon('init', '224da0d3-665b-400b-9fc8-812e9e1ff8b8');
                            window.Beacon('prefill', {
                                name: '${viewerSession.username}',
                                email: '${viewerSession.email}'
                            })
                            window.Beacon('config', {enablePreviousMessages: false})`,
                                }}
                            />
                        </>
                    )}
                    <link
                        rel="preload"
                        href={`${FONT_PATH}/OpenSans-Regular.ttf`}
                        as="font"
                        crossOrigin=""
                    />
                    <link
                        rel="preload"
                        href={`${FONT_PATH}/OpenSans-Regular.ttf`}
                        as="font"
                        crossOrigin=""
                    />
                </Head>

                <Flex direction="row" height="100%">
                    <SideBar />

                    <Flex direction="column" width="100%" bg="gray.100">
                        <React.Suspense fallback={<NavBarPlaceholder />}>
                            <NavBar title={navTitle} data={navData} />
                        </React.Suspense>
                        <LayoutProvider contentRef={contentRef}>
                            <Box
                                p={6}
                                className="container-content"
                                overflowY="scroll"
                                ref={contentRef}>
                                {children}
                            </Box>
                        </LayoutProvider>
                    </Flex>
                </Flex>
            </SideBarProvider>
        </NavBarProvider>
    );
};

export default Layout;
