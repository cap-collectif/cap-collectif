<?php

namespace Capco\AppBundle\EventListener;

use Overblog\GraphQLBundle\Event\ExecutorArgumentsEvent;

class GraphQlAclListener
{
    protected $disableAcl = false;

    public function onPreExecutor(ExecutorArgumentsEvent $event): void
    {
        if ($this->disableAcl) {
            $event->setContextValue(new \ArrayObject(['disable_acl' => true]));
        }
    }

    public function disableAcl(): self
    {
        $this->disableAcl = true;

        return $this;
    }

    public function enableAcl(): self
    {
        $this->disableAcl = false;

        return $this;
    }
}
