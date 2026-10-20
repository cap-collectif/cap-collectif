<?php

namespace Capco\AppBundle\GraphQL\Resolver\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\MenuItemRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MenuItemParentsResolver implements QueryInterface
{
    public function __construct(
        private readonly MenuItemRepository $menuItemRepository
    ) {
    }

    /**
     * @return array<MenuItem>
     */
    public function __invoke(): array
    {
        return $this->menuItemRepository->getParentCandidates();
    }
}
