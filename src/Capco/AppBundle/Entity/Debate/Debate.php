<?php

namespace Capco\AppBundle\Entity\Debate;

use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\Collection;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * A debate.
 *
 * @ORM\Table(
 *     name="debate",
 *     uniqueConstraints={}
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateRepository")
 */
class Debate
{
    use UuidTrait;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Debate\DebateOpinion", mappedBy="debate",  cascade={"remove"}, orphanRemoval=true)
     */
    protected $opinions;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Debate\DebateArgument", mappedBy="debate",  cascade={"remove"}, orphanRemoval=true)
     */
    protected $arguments;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\DebateStep", inversedBy="debate", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $step;

    public function __construct()
    {
        $this->opinions = new ArrayCollection();
        $this->arguments = new ArrayCollection();
    }

    public function viewerCanParticipate(?User $viewer = null): bool
    {
        $step = $this->getStep();
        $project = $step->getProject();

        if (!$project->viewerCanSee($viewer)) {
            return false;
        }

        return $step->canContribute($viewer);
    }

    public function getStep(): ?DebateStep
    {
        return $this->step;
    }

    public function setStep(DebateStep $step): self
    {
        $this->step = $step;

        return $this;
    }

    public function getOpinions(): Collection
    {
        return $this->opinions;
    }

    public function addOpinion(DebateOpinion $opinion): self
    {
        if (!$this->opinions->contains($opinion)) {
            $this->opinions[] = $opinion;
        }

        return $this;
    }

    public function removeOpinion(DebateOpinion $opinion): self
    {
        $this->opinions->removeElement($opinion);

        return $this;
    }

    public function getArguments(): Collection
    {
        return $this->arguments;
    }

    public function addArgument(DebateArgument $argument): self
    {
        if (!$this->arguments->contains($argument)) {
            $this->arguments[] = $argument;
        }

        return $this;
    }

    public function removeArgument(DebateArgument $argument): self
    {
        $this->arguments->removeElement($argument);

        return $this;
    }
}
