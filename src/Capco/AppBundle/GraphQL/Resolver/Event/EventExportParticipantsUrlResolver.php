<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Security\EventVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class EventExportParticipantsUrlResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Event $event): string
    {
        return $this->router->generate(
            'app_export_event_participants',
            ['eventId' => $event->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function isGranted(Event $event): bool
    {
        return $this->authorizationChecker->isGranted(EventVoter::EXPORT, $event);
    }
}
