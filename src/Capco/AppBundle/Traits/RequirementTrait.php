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
            // set the owning side to null (unless already changed)
            if ($requirement->getStep() === $this) {
                $requirement->setStep(null);
            }
        }

        return $this;
    }

    public function getRequirements(): ?Collection
    {
        return $this->requirements;
    }
}
