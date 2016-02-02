<?php

namespace Capco\AppBundle\EventListener;


use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Capco\AppBundle\Model\HasDiffInterface;
use Capco\AppBundle\Generator\DiffGenerator;

class DiffSubscriber implements EventSubscriber
{
    protected $diffGenerator;

    public function __construct(DiffGenerator $diffGenerator)
    {
        $this->diffGenerator = $diffGenerator;
    }

    public function getSubscribedEvents()
    {
        return [
            'prePersist',
            'preUpdate',
        ];
    }

    public function prePersist(LifecycleEventArgs $args)
    {
        $this->generateDiff($args);
    }

    public function preUpdate(LifecycleEventArgs $args)
    {
        $this->generateDiff($args);
    }

    private function generateDiff(LifecycleEventArgs $args)
    {
        $entity = $args->getEntity();

        if (!$entity instanceof HasDiffInterface) {
            return;
        }

        $this->diffGenerator->generate($entity);
    }
}
