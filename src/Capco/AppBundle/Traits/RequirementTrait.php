<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Requirement;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

trait RequirementTrait
{
    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Requirement", mappedBy="step", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    protected $requirements;

    /**
     * @ORM\Column(name="requirements_reason", type="string", nullable=true)
     */
    private $requirementsReason;

    public function getRequirementsReason(): ?string
    {
        return $this->requirementsReason;
    }

    public function setRequirementsReason(string $requirementsReason = null): self
    {
        $this->requirementsReason = $requirementsReason;

        return $this;
    }

    public function addRequirement(Requirement $requirement): self
    {
        if (!$this->requirements->contains($requirement)) {
            $this->requirements[] = $requirement;
            $requirement->setStep($this);
        }

        return $this;
    }

    public function removeRequirement(Requirement $requirement): self
    {
        if ($this->requirements->contains($requirement)) {
            $this->requirements->removeElement($requirement);
        }

        return $this;
    }

    public function getRequirements(): ?Collection
    {
        return $this->requirements;
    }
}
