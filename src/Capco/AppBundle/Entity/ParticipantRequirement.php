<?php

namespace Capco\AppBundle\Entity;

use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="participant_requirement")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ParticipantRequirementRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class ParticipantRequirement implements EntityInterface
{
    public function __construct(
        /**
         * @ORM\Id
         * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Participant")
         * @ORM\JoinColumn(name="participant_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
         */
        protected Participant $participant,
        /**
         * @ORM\Id
         * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Requirement")
         * @ORM\JoinColumn(name="requirement_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
         */
        protected Requirement $requirement,
        /**
         * @ORM\Column(name="value", type="boolean", nullable=false)
         */
        protected bool $value = true
    ) {
    }

    public function getValue(): bool
    {
        return $this->value;
    }

    public function setValue(bool $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getRequirement(): Requirement
    {
        return $this->requirement;
    }

    public function getParticipant(): Participant
    {
        return $this->participant;
    }
}
