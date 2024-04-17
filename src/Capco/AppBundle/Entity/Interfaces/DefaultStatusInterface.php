<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\Status;

interface DefaultStatusInterface
{
    public function getDefaultStatus(): ?Status;

    public function setDefaultStatus(?Status $defaultStatus = null): self;
}
