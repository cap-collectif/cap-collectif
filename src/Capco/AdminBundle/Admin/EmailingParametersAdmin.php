<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

class EmailingParametersAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_emailing_parameters';
    protected $baseRoutePattern = 'mailingParameters';

    public function getFeatures(): array
    {
        return ['beta__emailing_parameters'];
    }

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Emailing:emailingParameters.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
