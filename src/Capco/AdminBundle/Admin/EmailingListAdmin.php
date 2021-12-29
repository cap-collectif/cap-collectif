<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

class EmailingListAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_emailing_mailingList';
    protected $baseRoutePattern = 'mailingList';

    public function getFeatures(): array
    {
        return ['beta__emailing'];
    }

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Emailing:emailingList.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'create']);
    }
}
