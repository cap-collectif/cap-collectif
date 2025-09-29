<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Helper\EventHelper;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class EventIsRegistrationPossibleResolver implements QueryInterface
{
    public function __construct(
        protected EventHelper $helper
    ) {
    }

    public function __invoke(Event $event): bool
    {
        return $this->helper->isRegistrationPossible($event);
    }
}
