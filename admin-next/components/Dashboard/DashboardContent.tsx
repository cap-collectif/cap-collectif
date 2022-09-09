import { FC, useEffect, useState, useMemo, Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';
import { Flex } from '@cap-collectif/ui';
import SectionVisitors from './Sections/SectionVisitors/SectionVisitors';
import SectionRegistrations from './Sections/SectionRegistrations/SectionRegistrations';
import SectionContributors from './Sections/SectionContributors/SectionContributors';
import SectionPageViews from './Sections/SectionPageViews/SectionPageViews';
import DashboardFilters from './DashboardFilters/DashboardFilters';
import { DashboardContext, DEFAULT_FILTERS, FilterKey } from './Dashboard.context';
import DashboardEmptyState from './DashboardEmptyState/DashboardEmptyState';
import { useAppContext } from '../AppProvider/App.context';
import type { QueryOptionsSections } from './Sections/Sections.utils';
import SectionPlaceholder from './Sections/SectionPlaceholder';
import SectionParticipations from './Sections/SectionParticipations/SectionParticipations';
import SectionMostVisitedPages from './Sections/SectionMostVisitedPages/SectionMostVisitedPages';
import SectionTopContributors from './Sections/SectionTopContributors/SectionTopContributors';
import SectionTraffic from './Sections/SectionTraffic/SectionTraffic';
import SectionProposalCategories from './Sections/SectionProposalCategories/SectionProposalCategories';
import useUrlState from '@hooks/useUrlState';
import type { DashboardContent_viewer$key } from '@relay/DashboardContent_viewer.graphql';

const FRAGMENT = graphql`
    fragment DashboardContent_viewer on User
    @argumentDefinitions(
        affiliations: { type: "[ProjectAffiliation!]" }
        count: { type: "Int!" }
        cursor: { type: "String" }
    ) {
        userProjects: projects(affiliations: $affiliations, first: $count, after: $cursor) {
            totalCount
            edges {
                node {
                    id
                    timeRange {
                        startAt
                        endAt
                    }
                }
            }
        }
        ...DashboardFilters_viewer
            @arguments(affiliations: $affiliations, count: $count, cursor: $cursor)
    }
`;

type DashboardContentProps = {
    viewer: DashboardContent_viewer$key,
};

const DashboardContent: FC<DashboardContentProps> = ({ viewer: viewerFragment }) => {
    const [projectId, setProjectId] = useUrlState('projectId', DEFAULT_FILTERS.projectId);
    const [dateRange, setDateRange] = useUrlState(
        'dateRange',
        JSON.stringify(DEFAULT_FILTERS.dateRange),
    );

    const { viewerSession } = useAppContext();
    const viewer = useFragment(FRAGMENT, viewerFragment);
    const projects = viewer?.userProjects;

    /**
     * QUERIES REFRESHERS
     * Each section has his refresher, because each one has an individual query
     *  */
    const [queryOptionsSections, setQueryOptionsSections] = useState<QueryOptionsSections>({
        visitors: {},
        registrations: {},
        contributors: {},
        pageViews: {},
        participations: {},
        mostVisitedPages: {},
        topContributors: {},
        traffic: {},
        proposalCategories: {},
    });

    const hasProjects = projects?.totalCount > 0;

    useEffect(() => {
        if (hasProjects && !viewerSession.isAdmin && projectId === 'ALL') {
            const projectIds = projects?.edges?.filter(Boolean).map(edge => edge?.node.id) || [];
            if (projectIds[0]) setProjectId(projectIds[0]);
        }
    }, [projectId, setProjectId, viewerSession.isAdmin, projects]);

    const contextValue = useMemo(
        () => ({
            filters: {
                dateRange: {
                    startAt: JSON.parse(dateRange).startAt,
                    endAt: JSON.parse(dateRange).endAt,
                },
                projectId,
            },
            setFilters: (key: FilterKey, value: string) => {
                switch (key) {
                    case 'dateRange':
                        return setDateRange(value);
                    case 'projectId':
                        return setProjectId(value);
                }
            },
        }),
        [dateRange, projectId],
    );

    if (!hasProjects) return <DashboardEmptyState />;

    return (
        <DashboardContext.Provider value={contextValue}>
            <Flex direction="column" spacing={8}>
                <DashboardFilters viewer={viewer} />

                <Flex direction="row" justify="flex-start" overflow="auto" spacing={8}>
                    <Suspense
                        fallback={
                            <SectionPlaceholder
                                name="visitors"
                                setQueryOptions={setQueryOptionsSections}
                            />
                        }>
                        <SectionVisitors queryOptions={queryOptionsSections['visitors']} />
                    </Suspense>

                    {projectId === 'ALL' && (
                        <Suspense
                            fallback={
                                <SectionPlaceholder
                                    name="registrations"
                                    setQueryOptions={setQueryOptionsSections}
                                />
                            }>
                            <SectionRegistrations
                                queryOptions={queryOptionsSections['registrations']}
                            />
                        </Suspense>
                    )}

                    <Suspense
                        fallback={
                            <SectionPlaceholder
                                name="contributors"
                                setQueryOptions={setQueryOptionsSections}
                            />
                        }>
                        <SectionContributors queryOptions={queryOptionsSections['contributors']} />
                    </Suspense>

                    <Suspense
                        fallback={
                            <SectionPlaceholder
                                name="pageViews"
                                setQueryOptions={setQueryOptionsSections}
                            />
                        }>
                        <SectionPageViews queryOptions={queryOptionsSections['pageViews']} />
                    </Suspense>
                </Flex>

                <Flex direction="row" justify="space-between" spacing={8}>
                    <Suspense
                        fallback={
                            <SectionPlaceholder
                                name="participations"
                                setQueryOptions={setQueryOptionsSections}
                            />
                        }>
                        <SectionParticipations
                            queryOptions={queryOptionsSections['participations']}
                        />
                    </Suspense>

                    <Flex direction="column" spacing={8} width="50%">
                        <Suspense
                            fallback={
                                <SectionPlaceholder
                                    name="mostVisitedPages"
                                    setQueryOptions={setQueryOptionsSections}
                                />
                            }>
                            <SectionMostVisitedPages
                                queryOptions={queryOptionsSections['mostVisitedPages']}
                            />
                        </Suspense>

                        <Suspense
                            fallback={
                                <SectionPlaceholder
                                    name="topContributors"
                                    setQueryOptions={setQueryOptionsSections}
                                />
                            }>
                            <SectionTopContributors
                                queryOptions={queryOptionsSections['topContributors']}
                            />
                        </Suspense>
                    </Flex>
                </Flex>

                <Flex direction="row" justify="space-between" spacing={8}>
                    <Suspense
                        fallback={
                            <SectionPlaceholder
                                name="traffic"
                                setQueryOptions={setQueryOptionsSections}
                            />
                        }>
                        <SectionTraffic queryOptions={queryOptionsSections['traffic']} />
                    </Suspense>

                    <Suspense
                        fallback={
                            <SectionPlaceholder
                                name="proposalCategories"
                                setQueryOptions={setQueryOptionsSections}
                            />
                        }>
                        <SectionProposalCategories
                            queryOptions={queryOptionsSections['proposalCategories']}
                        />
                    </Suspense>
                </Flex>
            </Flex>
        </DashboardContext.Provider>
    );
};

export default DashboardContent;
