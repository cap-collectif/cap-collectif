<?php

namespace Capco\AdminBundle\Admin;

class EventAdmin extends AbstractAdmin
{
    protected function configure(): void
    {
        //$this->setTemplate('create', 'CapcoAdminBundle:Event:create.html.twig');
        //$this->setTemplate('edit', 'CapcoAdminBundle:Event:edit.html.twig');
        parent::configure();
    }

    public function getFeatures()
    {
        return ['calendar'];
    }
}
