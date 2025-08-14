<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Doctrine\ORM\Mapping as ORM;

trait CompletionStatusTrait
{
    /**
     * @ORM\Column(name="completion_status", type="string", nullable=false, options={"default" : "COMPLETED"})
     */
    protected string $completionStatus = ContributionCompletionStatus::COMPLETED;

    public function getCompletionStatus(): string
    {
        return $this->completionStatus;
    }

    public function setMissingRequirementsStatus(): self
    {
        $this->completionStatus = ContributionCompletionStatus::MISSING_REQUIREMENTS;

        return $this;
    }

    public function setCompletedStatus(): self
    {
        $this->completionStatus = ContributionCompletionStatus::COMPLETED;

        return $this;
    }
}
