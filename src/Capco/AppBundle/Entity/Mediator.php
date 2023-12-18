<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Repository\MediatorRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="mediator")
 * @ORM\Entity(repositoryClass=MediatorRepository::class)
 */
class Mediator
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="mediators")
     * @ORM\JoinColumn(nullable=false, name="user_id", referencedColumnName="id")
     */
    private User $user;

    /**
     * @ORM\ManyToOne(targetEntity=AbstractStep::class, inversedBy="mediators")
     * @ORM\JoinColumn(nullable=false, name="step_id", referencedColumnName="id")
     */
    private AbstractStep $step;

    /**
     * @ORM\OneToMany(targetEntity=ProposalSelectionVote::class, mappedBy="mediator", orphanRemoval=true)
     */
    private Collection $votes;

    /**
     * @ORM\OneToMany(targetEntity=MediatorParticipantStep::class, mappedBy="mediator", orphanRemoval=true)
     */
    private Collection $mediatorParticipantSteps;

    public function __construct()
    {
        $this->mediatorParticipantSteps = new ArrayCollection();
    }

    public function getStep(): ?AbstractStep
    {
        return $this->step;
    }

    public function setStep(?AbstractStep $step): self
    {
        $this->step = $step;

        return $this;
    }

    public function getVotes(): Collection
    {
        return $this->votes;
    }

    public function addVote(AbstractVote $vote): self
    {
        if (!$this->votes->contains($vote)) {
            $this->votes[] = $vote;
            $vote->setMediator($this);
        }

        return $this;
    }

    public function removeVote(AbstractVote $vote): self
    {
        if ($this->votes->removeElement($vote)) {
            // set the owning side to null (unless already changed)
            if ($vote->getMediator() === $this) {
                $vote->setMediator(null);
            }
        }

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, MediatorParticipantStep>
     */
    public function getMediatorParticipantSteps(): Collection
    {
        return $this->mediatorParticipantSteps;
    }

    public function addMediatorParticipantStep(MediatorParticipantStep $mediatorParticipantStep): self
    {
        if (!$this->mediatorParticipantSteps->contains($mediatorParticipantStep)) {
            $this->mediatorParticipantSteps[] = $mediatorParticipantStep;
            $mediatorParticipantStep->setMediator($this);
        }

        return $this;
    }

    public function removeMediatorParticipantStep(MediatorParticipantStep $mediatorParticipantStep): self
    {
        if ($this->mediatorParticipantSteps->removeElement($mediatorParticipantStep)) {
            // set the owning side to null (unless already changed)
            if ($mediatorParticipantStep->getMediator() === $this) {
                $mediatorParticipantStep->setMediator(null);
            }
        }

        return $this;
    }
}
