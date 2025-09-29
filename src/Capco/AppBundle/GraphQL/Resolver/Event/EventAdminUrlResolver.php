<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class EventAdminUrlResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        protected RouterInterface $router
    ) {
    }

    public function __invoke(Event $event): string
    {
        return $this->getEditUrl($event);
    }

    public function getEditUrl(Event $event): string
    {
        return $this->router->generate(
            'admin_capco_app_event_edit',
            ['id' => $event->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
