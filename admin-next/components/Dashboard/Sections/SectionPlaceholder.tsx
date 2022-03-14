import type { FC, SetStateAction, Dispatch } from 'react';
import type { QueryOptionsSections } from './Sections.utils';
import { useCallback, useEffect } from 'react';
import SmallChartPlaceholder from '@ui/Charts/SmallChart/SmallChartPlaceholder';
import TabsChartPlaceholder from '@ui/Charts/TabsChart/TabsChartPlaceholder';
import SectionPlaceholderUI from '@ui/Section/SectionPlaceholder';
import ViewChartPlaceholder from '@ui/Charts/ViewChart/ViewChartPlaceholder';
import ContributorPlaceholder from './SectionTopContributors/ContributorPlaceholder';
import TrafficChartPlaceholder from '@ui/Charts/TrafficChart/TrafficChartPlaceholder';
import PieChartPlaceholder from '@ui/Charts/PieChart/PieChartPlaceholder';

type SectionPlaceholderProps = {
    name: string,
    setQueryOptions: Dispatch<SetStateAction<QueryOptionsSections>>,
};

const SectionPlaceholder: FC<SectionPlaceholderProps> = ({ name, setQueryOptions }) => {
    const refresh = useCallback(() => {
        setQueryOptions((prev: QueryOptionsSections) => ({
            ...prev,
            [name]: {
                fetchKey: (prev[name]?.fetchKey ?? 0) + 1,
                fetchPolicy: 'network-only',
            },
        }));
    }, []);

    useEffect(() => {
        const intervalRefreshing = setInterval(() => {
            refresh();
        }, 2000);

        return () => clearInterval(intervalRefreshing);
    }, [refresh]);

    switch (name) {
        case 'visitors':
        case 'registrations':
        case 'contributors':
        case 'pageViews':
        default:
            return <SmallChartPlaceholder />;
        case 'participations':
            return (
                <SectionPlaceholderUI width="50%">
                    <TabsChartPlaceholder />
                </SectionPlaceholderUI>
            );
        case 'mostVisitedPages':
            return (
                <SectionPlaceholderUI direction="column" spacing={5}>
                    <ViewChartPlaceholder />
                    <ViewChartPlaceholder />
                    <ViewChartPlaceholder />
                </SectionPlaceholderUI>
            );
        case 'topContributors':
            return (
                <SectionPlaceholderUI direction="row" justify="space-between" spacing={7}>
                    <ContributorPlaceholder />
                    <ContributorPlaceholder />
                    <ContributorPlaceholder />
                    <ContributorPlaceholder />
                </SectionPlaceholderUI>
            );
        case 'traffic':
            return (
                <SectionPlaceholderUI width="50%">
                    <TrafficChartPlaceholder />
                </SectionPlaceholderUI>
            );
        case 'proposalCategories':
            return (
                <SectionPlaceholderUI width="50%">
                    <PieChartPlaceholder />
                </SectionPlaceholderUI>
            );
    }
};

export default SectionPlaceholder;
