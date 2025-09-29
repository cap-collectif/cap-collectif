<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class EventUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly UrlResolver $urlResolver,
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Event $event, bool $isAdminUrl = false): string
    {
        if ($isAdminUrl) {
            return $this->router->generate(
                'admin_capco_app_event_edit',
                ['id' => $event->getId()],
                RouterInterface::ABSOLUTE_URL
            );
        }

        return $this->urlResolver->getObjectUrl($event, true);
    }
}
