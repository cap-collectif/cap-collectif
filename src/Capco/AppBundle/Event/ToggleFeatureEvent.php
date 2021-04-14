<?php

namespace Capco\AppBundle\Event;

use Qandidate\Toggle\Toggle;
use Symfony\Component\EventDispatcher\Event;

class ToggleFeatureEvent extends Event
{
    public const NAME = 'toggle.feature';

    private Toggle $toggle;

    public function __construct(Toggle $toggle)
    {
        $this->toggle = $toggle;
    }

    public function getToggle()
    {
        return $this->toggle;
    }
}
