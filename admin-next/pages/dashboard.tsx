import { NextPage, GetServerSideProps } from 'next';
import Sidebar from '~/components/Admin/Sidebar/Sidebar';
import React, { lazy, Suspense } from 'react';
import DashboardPagePlaceholder from '~/components/Admin/Dashboard/DashboardPagePlaceholder';
import { PageProps } from '../types';

const DashboardPageQuery = lazy(() =>
    import(
        /* webpackChunkName: "DashboardPageQuery" */ '~/components/Admin/Dashboard/DashboardPageQuery'
    ),
);

const Dashboard: NextPage<PageProps> = ({ appVersion, viewerSession }) => {
    return (
        <>
            <Sidebar appVersion={appVersion} />
            <Suspense fallback={<DashboardPagePlaceholder />}>
                <DashboardPageQuery />
            </Suspense>
        </>
    );
};

export default Dashboard;
