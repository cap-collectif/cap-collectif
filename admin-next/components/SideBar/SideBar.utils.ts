import sideBarItems from './SideBarItems.json';
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql';
import { FeatureFlags } from '../../types';

export const getSideBarItemsFiltered = (
    isAdmin: boolean,
    allFeatureFlags: FeatureFlags,
): typeof sideBarItems => {
    return sideBarItems.reduce<typeof sideBarItems>((acc, sideBarItem) => {
        const isItemForAdminOnly =
            (sideBarItem.rolesRequired as string[]).includes('admin') && isAdmin;
        const isItemForAll = sideBarItem.rolesRequired.length === 0;
        const hasItemFeatureRequired = (sideBarItem.featuresRequired as FeatureFlagType[]).every(
            featureRequired => allFeatureFlags[featureRequired],
        );

        if ((isItemForAdminOnly || isItemForAll) && hasItemFeatureRequired) {
            // Filtering sub items of a menu here
            sideBarItem.items = sideBarItem.items.filter(subItem => {
                const isSubItemForAdminOnly =
                    (subItem.rolesRequired as string[]).includes('admin') && isAdmin;
                const isSubItemForAll = subItem.rolesRequired.length === 0;
                const hasSubItemsFeatureRequired = (
                    subItem.featuresRequired as FeatureFlagType[]
                ).every(featureRequired => allFeatureFlags[featureRequired]);

                if (isSubItemForAdminOnly || (isSubItemForAll && hasSubItemsFeatureRequired))
                    return subItem;
            });

            acc.push(sideBarItem);
        }

        return acc;
    }, []);
};
