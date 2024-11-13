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
        $this->setTemplates([
            'list' => '@CapcoAdmin/Event/list.html.twig',
            'create' => '@CapcoAdmin/Event/create.html.twig',
        ]);
    }
}
