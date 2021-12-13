import * as React from 'react';
import NavBar, { NavBarProps } from '../NavBar/NavBar';
import { useIntl } from 'react-intl';
import Head from 'next/head';
import NavBarPlaceholder from '../NavBar/NavBarPlaceholder';
import { NavBarProvider } from '../NavBar/NavBar.context';
import { useAppContext } from '../AppProvider/App.context';
import { FONT_PATH } from '../../styles/Fonts';

export interface LayoutProps {
    children: React.ReactNode;
    navTitle: NavBarProps['title'];
    navData?: NavBarProps['data'];
    title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, navTitle, navData, title }) => {
    const intl = useIntl();
    const { viewerSession } = useAppContext();

    return (
        <NavBarProvider>
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

                <link rel="preload" href={`${FONT_PATH}/OpenSans-Regular.ttf`} as="font" crossOrigin="" />
                <link rel="preload" href={`${FONT_PATH}/OpenSans-Regular.ttf`} as="font" crossOrigin="" />
            </Head>

            <React.Suspense fallback={<NavBarPlaceholder />}>
                <NavBar title={navTitle} data={navData} />
            </React.Suspense>

            {children}
        </NavBarProvider>
    );
};

export default Layout;
