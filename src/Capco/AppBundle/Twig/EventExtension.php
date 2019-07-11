<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Helper\EventHelper;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class EventExtension extends AbstractExtension
{
    protected $helper;

    public function __construct(EventHelper $helper)
    {
        $this->helper = $helper;
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('capco_event_registration_possible', [$this, 'isRegistrationPossible']),
            new TwigFilter('capco_event_user_registered', [$this, 'isRegistered'])
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
