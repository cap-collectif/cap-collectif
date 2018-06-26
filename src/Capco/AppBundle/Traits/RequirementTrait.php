<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Requirement;
use Doctrine\ORM\Mapping as ORM;

trait RequirementTrait
{
    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Requirement", mappedBy="step", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    protected $requirements;

    public function addRequirement(Requirement $requirement)
    {
        if (!$this->requirements->contains($requirement)) {
            $this->requirements[] = $requirement;
            $requirement->setStep($this);
        }

        return $this;
    }

    public function removeRequirement(Requirement $requirement)
    {
        $this->requirements->removeElement($requirement);
    }

    public function getRequirements()
    {
        return $this->requirements;
    }
}
