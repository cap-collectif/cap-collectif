<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Helper\EventHelper;

class EventExtension extends \Twig_Extension
{
    protected $helper;

    public function __construct(EventHelper $helper)
    {
        $this->helper = $helper;
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('capco_event_registration_possible', [$this, 'isRegistrationPossible']),
            new \Twig_SimpleFilter('capco_event_user_registered', [$this, 'isRegistered']),
        ];
    }

    public function isRegistrationPossible($event)
    {
        return $this->helper->isRegistrationPossible($event);
    }

    public function isRegistered($event, $user)
    {
        return $this->helper->findUserRegistrationOrCreate($event, $user)->isConfirmed();
    }
}
