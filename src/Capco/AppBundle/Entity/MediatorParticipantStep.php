<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\MediatorParticipantStepRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="mediator_participant_step")
 * @ORM\Entity(repositoryClass=MediatorParticipantStepRepository::class)
 */
class MediatorParticipantStep implements EntityInterface
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity=Mediator::class, inversedBy="mediatorParticipantSteps")
     * @ORM\JoinColumn(nullable=false)
     */
    private Mediator $mediator;

    /**
     * @ORM\ManyToOne(targetEntity=Participant::class, inversedBy="mediatorParticipantSteps")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Participant $participant;

    /**
     * @ORM\ManyToOne(targetEntity=SelectionStep::class, inversedBy="mediatorParticipantSteps")
     * @ORM\JoinColumn(nullable=false)
     */
    private SelectionStep $step;

    public function getMediator(): ?Mediator
    {
        return $this->mediator;
    }

    public function setMediator(?Mediator $mediator): self
    {
        $this->mediator = $mediator;

        return $this;
    }

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }

    public function setParticipant(?Participant $participant): self
    {
        $this->participant = $participant;

        return $this;
    }

    public function getStep(): ?SelectionStep
    {
        return $this->step;
    }

    public function setStep(?SelectionStep $step): self
    {
        $this->step = $step;

        return $this;
    }
}
