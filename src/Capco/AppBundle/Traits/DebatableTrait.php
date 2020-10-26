<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Debate\Debate;

trait DebatableTrait
{
    public function getDebate(): ?Debate
    {
        return $this->debate;
    }

    public function setDebate(Debate $debate): self
    {
        $this->debate = $debate;

        return $this;
    }
}
