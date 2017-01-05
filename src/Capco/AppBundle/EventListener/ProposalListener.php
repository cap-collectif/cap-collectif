<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Answer;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Capco\AppBundle\Entity\Proposal;
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
            $notifier = $this->container->get('capco.notify_manager');

            if (
                $this->container->get('security.token_storage')->getToken()
                && $this->container->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ) {
                $entity->setUpdateAuthor($this->container->get('security.token_storage')->getToken()->getUser());
            }

            if (array_key_exists('answer', $changeSet) && $changeSet['answer'][1] instanceof Answer) {
                $notifier->notifyProposalAnswer($entity);
            }
        }
    }

    public function preRemove(LifecycleEventArgs $args)
    {
        $entity = $args->getObject();

        if ($entity instanceof Proposal) {
            $args->getObjectManager()->remove($entity->getSelections());
            $args->getObjectManager()->flush();
        }
    }
}
