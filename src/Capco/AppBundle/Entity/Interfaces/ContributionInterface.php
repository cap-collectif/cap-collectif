<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\AbstractStep;

interface ContributionInterface
{
    public function getStep(): ?AbstractStep;

    public function getCompletionStatus(): string;

    public function setMissingRequirementsStatus(): self;

    public function setCompletedStatus(): self;

    public function getParticipant(): ?Participant;
}
