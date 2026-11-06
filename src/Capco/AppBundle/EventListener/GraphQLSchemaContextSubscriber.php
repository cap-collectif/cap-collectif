<?php

declare(strict_types=1);

namespace Capco\AppBundle\EventListener;

use Overblog\GraphQLBundle\Event\Events;
use Overblog\GraphQLBundle\Event\ExecutorArgumentsEvent;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class GraphQLSchemaContextSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [Events::PRE_EXECUTOR => ['onPreExecutor', 256]];
    }

    public function onPreExecutor(ExecutorArgumentsEvent $event): void
    {
        // Cached schemas may execute without loading types, leaving the previous schema selected.
        $this->typeResolver->setCurrentSchemaName($event->getSchemaName());
    }
}
