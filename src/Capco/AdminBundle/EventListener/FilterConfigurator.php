<?php

namespace Capco\AdminBundle\EventListener;

use Doctrine\Orm\EntityManagerInterface;
use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;

class FilterConfigurator
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function onKernelController(FilterControllerEvent $event)
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
