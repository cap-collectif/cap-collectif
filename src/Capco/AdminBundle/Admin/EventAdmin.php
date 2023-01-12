<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;

class EventAdmin extends AbstractAdmin
{
    public function __construct(
        string $code,
        string $class,
        string $baseControllerName
    ) {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function getFeatures()
    {
        return ['calendar'];
    }

    // While route en template are not totally managed by admin next, we need to keep it
    public function getTemplate($name)
    {
        if ('create' === $name) {
            return 'CapcoAdminBundle:Event:create.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Event:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }
}
