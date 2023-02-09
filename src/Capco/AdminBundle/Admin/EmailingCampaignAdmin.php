<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollectionInterface;

class EmailingCampaignAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_emailing_campaign';
    protected $baseRoutePattern = 'mailingCampaign';

    protected function configure(): void
    {
        //$this->setTemplate('list', 'CapcoAdminBundle:Emailing:emailingCampaign.html.twig');
        parent::configure();
    }

    public function getFeatures(): array
    {
        return ['beta__emailing'];
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list']);
        $collection->add('editParameters', 'edit/' . $this->getRouterIdParameter());
        $collection->add('editContent', 'edit/' . $this->getRouterIdParameter() . '/content');
        $collection->add('editSending', 'edit/' . $this->getRouterIdParameter() . '/sending');
    }
}
