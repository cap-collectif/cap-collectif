<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use FOS\ElasticaBundle\Persister\ObjectPersister;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ElasticaListener implements EventSubscriber, ContainerAwareInterface
{
    private $objectPersisterProposal;
    private $objectPersisterSelection;
    private $container; // Injecting the repo creates a circular reference

    public function __construct(ObjectPersister $objectPersisterProposal, ObjectPersister $objectPersisterSelection)
    {
        $this->objectPersisterProposal = $objectPersisterProposal;
        $this->objectPersisterSelection = $objectPersisterSelection;
    }

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getSubscribedEvents()
    {
        return [
            'postPersist',
            'postUpdate',
            'preRemove',
        ];
    }

    public function postPersist(LifecycleEventArgs $args)
    {
        $this->updateProposalsFromEntity($args->getObject());
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
            $selections = $this
                ->container
                ->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:Selection')
                ->findBy([
                'status' => $entity,
            ]);
            foreach ($selections as $selection) {
                $this->objectPersisterSelection->replaceOne($selection);
                $this->objectPersisterProposal->replaceOne($selection->getProposal());
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
