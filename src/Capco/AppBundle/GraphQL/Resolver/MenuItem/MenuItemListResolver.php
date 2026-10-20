<?php

namespace Capco\AppBundle\GraphQL\Resolver\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MenuItemListResolver implements QueryInterface
{
    public function __construct(
        private readonly MenuItemRepository $menuItemRepository,
        private readonly Manager $toggleManager
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $search = $args['search'] ?? null;
        $ids = $this->getIdsWithEnabledFeatures();

        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => [] === $ids ? [] : $this->menuItemRepository
                ->getAdminPaginated($ids, $search, $offset, $limit)
                ->getIterator()
                ->getArrayCopy()
        );

        $connection = $paginator->auto($args, [] === $ids ? 0 : $this->menuItemRepository->countAdmin($ids, $search));
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving menu items.');
        }

        return $connection;
    }

    /**
     * Items bound to a disabled feature (e.g. "Events" without the calendar feature) are hidden, as in Sonata.
     *
     * @return array<int>
     */
    private function getIdsWithEnabledFeatures(): array
    {
        /** @var array<MenuItem> $allMenuItems */
        $allMenuItems = $this->menuItemRepository->findAll();
        $menuItems = array_filter(
            $allMenuItems,
            fn (MenuItem $menuItem): bool => $this->toggleManager->containsEnabledFeature(
                (array) $menuItem->getAssociatedFeatures()
            )
        );

        return array_values(array_map(fn (MenuItem $menuItem): int => (int) $menuItem->getId(), $menuItems));
    }
}
