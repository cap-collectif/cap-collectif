<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class EventUrlResolver implements ResolverInterface
{
    private $urlResolver;
    private $router;

    public function __construct(UrlResolver $urlResolver, RouterInterface $router)
    {
        $this->urlResolver = $urlResolver;
        $this->router = $router;
    }

    public function __invoke(Event $event, bool $adminUrl = false): string
    {
        if ($adminUrl) {
            return $this->router->generate(
                'admin_capco_app_event_edit',
                ['id' => $event->getId()],
                true
            );
        }

        return $this->urlResolver->getObjectUrl($event, true);
    }
}
