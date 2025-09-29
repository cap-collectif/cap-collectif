<?php

namespace Capco\AppBundle\Event;

use Qandidate\Toggle\Toggle;
use Symfony\Contracts\EventDispatcher\Event;

class ToggleFeatureEvent extends Event
{
    final public const NAME = 'toggle.feature';

    public function __construct(
        private readonly Toggle $toggle
    ) {
    }

    public function getToggle(): Toggle
    {
        return $this->toggle;
    }
}
