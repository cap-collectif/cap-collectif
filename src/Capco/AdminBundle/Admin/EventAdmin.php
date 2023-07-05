<?php

namespace Capco\AdminBundle\Admin;

class EventAdmin extends AbstractAdmin
{
    public function getFeatures()
    {
        return ['calendar'];
    }

    protected function configure(): void
    {
        //$this->setTemplate('create', 'CapcoAdminBundle:Event:create.html.twig');
        //$this->setTemplate('edit', 'CapcoAdminBundle:Event:edit.html.twig');
        parent::configure();
    }
}
