<?php

namespace Capco\AdminBundle\EventListener;

use Doctrine\ORM\Event\PreUpdateEventArgs;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class StatusChanger implements ContainerAwareInterface
{
    private $container;

    /**
     * @param ContainerInterface|null $container
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param PreUpdateEventArgs $args
     */
    public function preUpdate(PreUpdateEventArgs $args)
    {
        $entity = $args->getEntity();
        $changeSet = $args->getEntityChangeSet();

        if ($entity instanceof Proposal && array_key_exists('status', $changeSet)) {
            $notifier = $this->container->get('capco.notify_manager');
            $notifier->notifyProposalStatusChange($entity);
        }
    }
}
