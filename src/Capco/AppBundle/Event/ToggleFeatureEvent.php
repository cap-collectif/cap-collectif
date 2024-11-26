<?php

namespace Capco\AppBundle\Event;

use Qandidate\Toggle\Toggle;
use Symfony\Contracts\EventDispatcher\Event;

class ToggleFeatureEvent extends Event
{
    final public const NAME = 'toggle.feature';

    private readonly Toggle $toggle;

    public function __construct(Toggle $toggle)
    {
        $this->toggle = $toggle;
    }

    public function getToggle(): Toggle
    {
        return $this->toggle;
    }
}
