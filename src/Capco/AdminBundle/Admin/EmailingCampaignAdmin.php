<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

class EmailingCampaignAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_emailing_campaign';
    protected $baseRoutePattern = 'mailingCampaign';

    public function getFeatures(): array
    {
        return ['unstable__emailing'];
    }

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Emailing:emailingCampaign.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
        $collection->add('editParameters', 'edit/' . $this->getRouterIdParameter());
        $collection->add('editContent', 'edit/' . $this->getRouterIdParameter() . '/content');
        $collection->add('editSending', 'edit/' . $this->getRouterIdParameter() . '/sending');
    }
}
