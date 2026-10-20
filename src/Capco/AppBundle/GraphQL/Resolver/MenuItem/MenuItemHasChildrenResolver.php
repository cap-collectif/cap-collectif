<?php

namespace Capco\AppBundle\GraphQL\Resolver\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\MenuItemRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MenuItemHasChildrenResolver implements QueryInterface
{
    public function __construct(
        private readonly MenuItemRepository $menuItemRepository
    ) {
    }

    public function __invoke(MenuItem $menuItem): bool
    {
        return $this->menuItemRepository->hasChildren($menuItem);
    }
}
