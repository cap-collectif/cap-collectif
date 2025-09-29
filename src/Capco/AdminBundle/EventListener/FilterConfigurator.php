<?php

namespace Capco\AdminBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpKernel\Event\ControllerEvent;

class FilterConfigurator
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {
    }

    public function onKernelController(ControllerEvent $event)
    {
        $controller = $event->getController();
        $controllerClass = \is_array($controller) ? $controller[0] : $controller;

        if ($controllerClass instanceof CRUDController) {
            // Disable the built-in softdelete
            $filters = $this->em->getFilters();
            if ($filters->isEnabled('softdeleted')) {
                $filters->disable('softdeleted');
            }
        }
    }
}
