import { NextPage } from 'next';
import React, { lazy, Suspense } from 'react';
import Sidebar from '~/components/Admin/Sidebar/Sidebar';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { DashboardMailingListProvider } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.context';
import { PageProps } from '../types';

const EmailingListPage = lazy(() =>
    import(
        /* webpackChunkName: "EmailingListPage" */ '~/components/Admin/Emailing/EmailingList/EmailingListPage'
    ),
);

const Emails: NextPage<PageProps> = ({ appVersion }) => {
    return (
        <>
            <Sidebar appVersion={appVersion} />
            <Suspense fallback={<Loader />}>
                <DashboardMailingListProvider>
                    <EmailingListPage />
                </DashboardMailingListProvider>
            </Suspense>
        </>
    );
};

export default Emails;
