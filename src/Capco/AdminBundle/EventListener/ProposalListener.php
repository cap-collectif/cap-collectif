<?php

namespace Capco\AdminBundle\EventListener;

use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ProposalListener implements ContainerAwareInterface
{
    private $container;

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
            if ($this->container->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
                $entity->setUpdateAuthor($this->container->get('security.token_storage')->getToken()->getUser());
            }

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
