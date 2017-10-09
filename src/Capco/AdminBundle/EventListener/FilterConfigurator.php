<?php

namespace Capco\AdminBundle\EventListener;

use Doctrine\Orm\EntityManager;
use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class FilterConfigurator
{
    private $em;
    private $tokenStorage;

    public function __construct(EntityManager $em, TokenStorageInterface $tokenStorage)
    {
        $this->em = $em;
        $this->tokenStorage = $tokenStorage;
    }

    public function onKernelController(FilterControllerEvent $event)
    {
        $controller = $event->getController();
        $controllerClass = $controller[0];

        if ($controllerClass instanceof CRUDController) {
            $filters = $this->em->getFilters();
            if (
                $filters->isEnabled('softdeleted') &&
                $this->tokenStorage->getToken()->getUser()->hasRole('ROLE_ADMIN')
            ) {
                $this->em->getFilters()->disable('softdeleted');
            }
        }
    }
}
