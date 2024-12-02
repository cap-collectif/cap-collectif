<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MenuItemsResolver implements QueryInterface
{
    public function __construct(private readonly MenuItemRepository $menuItemRepository, private readonly Manager $manager)
    {
    }

    /**
     * @return MenuItem[]
     */
    public function __invoke(Argument $args): array
    {
        $items = $this->menuItemRepository->findMainEnabledNavBarItems();
        $items = $this->filterByEnabledFeatureToggle($items);

        return $this->filterNullableTitle($items);
    }

    /**
     * @param array<MenuItem> $items
     *
     * @return array<MenuItem>
     */
    private function filterByEnabledFeatureToggle(array $items): array
    {
        return array_filter($items, function ($item) {
            $requiredFeatureToggles = $item->getAssociatedFeatures();
            if (empty($requiredFeatureToggles)) {
                return true;
            }

            foreach ($requiredFeatureToggles as $featureToggle) {
                if (!$this->manager->isActive($featureToggle)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * @param array<MenuItem> $items
     *
     * @return array<MenuItem>
     */
    private function filterNullableTitle(array $items): array
    {
        return array_filter($items, function ($item) {
            return $item->getTitle();
        });
    }
}
