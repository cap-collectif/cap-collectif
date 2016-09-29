<?php

namespace Capco\AdminBundle\EventListener;

use Doctrine\Orm\EntityManager;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Sonata\AdminBundle\Controller\CRUDController;

class FilterConfigurator
{
    private $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function onKernelController(FilterControllerEvent $event)
    {
        $controller = $event->getController();
        $controllerClass = $controller[0];

        if ($controllerClass instanceof CRUDController) {
            $filters = $this->em->getFilters();
            if (array_key_exists('softdeleteable', $filters->getEnabledFilters())) {
                $filters->disable('softdeleteable');
            }
        }
    }
}
