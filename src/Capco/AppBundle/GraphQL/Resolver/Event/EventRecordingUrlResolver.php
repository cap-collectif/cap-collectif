<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class EventRecordingUrlResolver implements ResolverInterface
{
    public function __invoke(Event $event, $viewer): ?string
    {
        // Avoid a security security issue.
        // Here we should not expose this in API if replay is not published and user is not admin.
        if ($event->getIsRecordingPublished() || ($viewer && $viewer->isAdmin())) {
            return $event->getRecordingLink();
        }

        return null;
    }
}
