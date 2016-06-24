<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use FOS\ElasticaBundle\Persister\ObjectPersister;

class ElasticaListener implements EventSubscriber
{
    private $objectPersisterProposal;

    public function __construct(ObjectPersister $objectPersisterProposal)
    {
        $this->objectPersisterProposal = $objectPersisterProposal;
    }

    public function getSubscribedEvents()
    {
        return [
            'postUpdate',
            'preRemove',
        ];
    }

    public function postUpdate(LifecycleEventArgs $args)
    {
        $this->updateProposalsFromEntity($args->getObject());
    }

    public function preRemove(LifecycleEventArgs $args)
    {
        $this->updateProposalsFromEntity($args->getObject());
    }

    private function updateProposalsFromEntity($entity)
    {
        if ($entity instanceof Status) {
            foreach ($entity->getProposals() as $proposal) {
                $this->objectPersisterProposal->replaceOne($proposal);
            }
        }
        if ($entity instanceof District) {
            foreach ($entity->getProposals() as $proposal) {
                $this->objectPersisterProposal->replaceOne($proposal);
            }
        }
        if ($entity instanceof Selection) {
            $this->objectPersisterProposal->replaceOne($entity->getProposal());
        }
    }
}
