<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\MenuItemRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MenuItemChildrenResolver implements QueryInterface
{
    public function __construct(private readonly MenuItemRepository $menuItemRepository)
    {
    }

    /**
     * @return array<MenuItem>
     */
    public function __invoke(MenuItem $menuItem): array
    {
        return $this->menuItemRepository->getChildrenByItem($menuItem);
    }
}
