import { NextPage, GetServerSideProps } from 'next';
import Sidebar from '~/components/Admin/Sidebar/Sidebar';
import React, { lazy, Suspense } from 'react';
import DashboardPagePlaceholder from '~/components/Admin/Dashboard/DashboardPagePlaceholder';

const DashboardPageQuery = lazy(() =>
    import(
        /* webpackChunkName: "DashboardPageQuery" */ '~/components/Admin/Dashboard/DashboardPageQuery'
    ),
);

type Props = {
    appVersion: string;
};

const Home: NextPage<Props> = ({ appVersion }) => {
    return (
        <>
            <Sidebar appVersion={appVersion} />
            {/* <Suspense fallback={<DashboardPagePlaceholder />}>
                <DashboardPageQuery />
            </Suspense> */}
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async context => {
    // Fetch data from external API
    const appVersion = 'dev';

    return { props: { appVersion } };
};

export default Home;
