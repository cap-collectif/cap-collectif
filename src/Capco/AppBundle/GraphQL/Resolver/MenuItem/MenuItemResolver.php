<?php

namespace Capco\AppBundle\GraphQL\Resolver\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MenuItemResolver implements QueryInterface
{
    public function __construct(
        private readonly MenuItemRepository $menuItemRepository
    ) {
    }

    public function __invoke(Argument $args): ?MenuItem
    {
        $menuItem = $this->menuItemRepository->find(
            GlobalIdResolver::getDecodedId((string) $args->offsetGet('id'), true)
        );

        return $menuItem instanceof MenuItem ? $menuItem : null;
    }
}
