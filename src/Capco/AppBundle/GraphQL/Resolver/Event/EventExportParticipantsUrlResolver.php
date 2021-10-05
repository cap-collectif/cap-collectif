<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class EventExportParticipantsUrlResolver implements ResolverInterface
{
    private RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(Event $event): string
    {
        return $this->router->generate(
            'app_export_event_participants',
            ['eventId' => $event->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
