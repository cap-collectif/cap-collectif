<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class EventJitsiTokenResolver implements ResolverInterface
{
    use ResolverTrait;

    public function __invoke(Event $event, $viewer): ?string
    {
        $this->preventNullableViewer($viewer);

        if ($viewer->isAdmin()) {
            return $event->getJitsiToken();
        }

        if ($viewer === $event->getAnimator()) {
            return $event->getJitsiToken();
        }

        return null;
    }
}
