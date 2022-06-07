import { FC, useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { graphql, usePaginationFragment } from 'react-relay';
import { DateRange, Flex, Select } from '@cap-collectif/ui';
import type {
    DashboardFilters_viewer,
    DashboardFilters_viewer$key,
} from '@relay/DashboardFilters_viewer.graphql';
import { DEFAULT_FILTERS, FilterKey, useDashboard } from '../Dashboard.context';
import { useAppContext } from '../../AppProvider/App.context';
import moment from 'moment';

export const COUNT_PROJECT_PAGINATION = 20;

const FRAGMENT = graphql`
    fragment DashboardFilters_viewer on User
    @argumentDefinitions(
        affiliations: { type: "[ProjectAffiliation!]" }
        count: { type: "Int!" }
        cursor: { type: "String" }
    )
    @refetchable(queryName: "DashboardFiltersPaginationQuery") {
        projects(affiliations: $affiliations, first: $count, after: $cursor)
            @connection(key: "DashboardFilters_projects", filters: []) {
            totalCount
            edges {
                node {
                    id
                    title
                    timeRange {
                        startAt
                        endAt
                    }
                }
            }
        }
    }
`;

const getDateRangeProject = (
    projects: DashboardFilters_viewer['projects'],
    projectIdSelected: string,
) => {
    const projectSelected = projects?.edges
        ?.filter(Boolean)
        .map(edge => edge?.node)
        .filter(Boolean)
        .find(project => project && project.id === projectIdSelected);

    if (projectSelected && projectSelected.timeRange) {
        return {
            startAt: projectSelected.timeRange?.startAt || DEFAULT_FILTERS.dateRange.startAt,
            endAt: projectSelected.timeRange?.endAt || DEFAULT_FILTERS.dateRange.endAt,
        };
    }

    return {
        startAt: DEFAULT_FILTERS.dateRange.startAt,
        endAt: DEFAULT_FILTERS.dateRange.endAt,
    };
};

type DashboardFiltersProps = {
    viewer: DashboardFilters_viewer$key,
};

const DashboardFilters: FC<DashboardFiltersProps> = ({ viewer: viewerFragment }) => {
    const {
        data: viewer,
        loadNext,
        hasNext,
        refetch,
        isLoadingNext,
    } = usePaginationFragment(FRAGMENT, viewerFragment);
    const intl = useIntl();
    const firstRendered = useRef<boolean>(false);
    const { viewerSession } = useAppContext();
    const { setFilters, filters } = useDashboard();

    const { projects } = viewer;
    const [dateRange, setDateRange] = useState({
        startDate: moment(filters.dateRange.startAt),
        endDate: moment(filters.dateRange.endAt),
    });
    const canSelectDateOutRange = filters[FilterKey.PROJECT] === 'ALL';

    useEffect(() => {
        setDateRange({
            startDate: moment(filters.dateRange.startAt),
            endDate: moment(filters.dateRange.endAt),
        });
    }, [filters.dateRange]);

    useEffect(() => {
        if (filters.projectId !== 'ALL') {
            const dateRangeProject = getDateRangeProject(projects, filters.projectId);
            setFilters(FilterKey.DATE_RANGE, JSON.stringify(dateRangeProject));
        }
    }, [filters[FilterKey.PROJECT], projects]);

    useEffect(() => {
        if (firstRendered.current) {
            refetch({
                affiliations: viewerSession.isAdmin ? null : ['OWNER'],
            });
        }

        firstRendered.current = true;
    }, [viewerSession.isAdmin, refetch]);

    const defaultValue =
        projects?.totalCount > 0
            ? projects?.edges
                  ?.filter(Boolean)
                  .map(edge => edge?.node)
                  .filter(Boolean)
                  .find(project => project && project.id === filters.projectId) || 'ALL'
            : 'ALL';

    const defaultValueFormatted =
        defaultValue === 'ALL'
            ? {
                  label: intl.formatMessage({ id: 'global.all.projects' }),
                  value: 'ALL',
              }
            : {
                  id: defaultValue.id,
                  label: defaultValue.title,
              };

    return (
        <Flex direction="row" align="center" spacing={2}>
            <Select
                onChange={optionSelected => setFilters(FilterKey.PROJECT, optionSelected.value)}
                defaultValue={defaultValueFormatted}
                width="20%"
                isLoading={isLoadingNext}
                onMenuScrollToBottom={() => {
                    if (hasNext) loadNext(COUNT_PROJECT_PAGINATION);
                }}
                options={[
                    ...(viewerSession.isAdmin
                        ? [
                              {
                                  label: intl.formatMessage({ id: 'global.all.projects' }),
                                  value: 'ALL',
                              },
                          ]
                        : []),
                    ...(projects?.totalCount > 0
                        ? projects?.edges
                              ?.filter(Boolean)
                              .map(edge => edge?.node)
                              .filter(Boolean)
                              .map(
                                  project =>
                                      project && {
                                          label: project.title,
                                          value: project.id,
                                      },
                              ) || []
                        : []),
                ]}
            />

            <DateRange
                isOutsideRange
                value={dateRange}
                onChange={({ startDate, endDate }) => {
                    setDateRange({
                        startDate: startDate || dateRange.startDate,
                        endDate: endDate || dateRange.endDate,
                    });
                }}
                minDate={canSelectDateOutRange ? undefined : dateRange.startDate}
                onClose={({ startDate, endDate }) => {
                    const dateRangeUpdated = {
                        startAt: startDate
                            ? startDate.format('MM/DD/YYYY')
                            : dateRange.startDate.format('MM/DD/YYYY'),
                        endAt: endDate
                            ? endDate.format('MM/DD/YYYY')
                            : dateRange.endDate.format('MM/DD/YYYY'),
                    };

                    setFilters(FilterKey.DATE_RANGE, JSON.stringify(dateRangeUpdated));
                }}
            />
        </Flex>
    );
};

export default DashboardFilters;
