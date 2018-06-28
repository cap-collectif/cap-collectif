<?php

namespace Capco\AppBundle\EventListener;

use Overblog\GraphQLBundle\Event\ExecutorArgumentsEvent;

class DisableAclListener
{
    public function onPreExecutor(ExecutorArgumentsEvent $event): void
    {
        $event->setContextValue(new \ArrayObject(['disable_acl' => true]));
    }
}
