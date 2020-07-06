<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Helper\EventHelper;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class EventIsRegistrationPossibleResolver implements ResolverInterface
{
    protected EventHelper $helper;

    public function __construct(EventHelper $helper)
    {
        $this->helper = $helper;
    }

    public function __invoke(Event $event): bool
    {
        return $this->helper->isRegistrationPossible($event);
    }
}
