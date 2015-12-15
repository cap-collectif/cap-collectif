<?php

namespace Capco\AdminBundle\EventListener;

use Capco\AppBundle\Entity\Answer;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ProposalListener implements ContainerAwareInterface
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

        if ($entity instanceof Proposal) {
            $notifier = $this->container->get('capco.notify_manager');

            if (array_key_exists('status', $changeSet)) {
                $notifier->notifyProposalStatusChange($entity);
            }

            if (array_key_exists('answer', $changeSet) && $changeSet['answer'][1] instanceof Answer) {
                $notifier->notifyProposalAnswer($entity);
            }
        }
    }
}
