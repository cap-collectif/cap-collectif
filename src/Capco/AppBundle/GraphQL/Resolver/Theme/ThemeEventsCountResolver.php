<?php

namespace Capco\AppBundle\GraphQL\Resolver\Theme;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * Counts with a query rather than through the collection, which would hydrate every related event.
 */
class ThemeEventsCountResolver implements QueryInterface
{
    public function __construct(
        private readonly EventRepository $eventRepository
    ) {
    }

    public function __invoke(Theme $theme): int
    {
        return $this->eventRepository->countByTheme($theme);
    }
}
