<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="participant_phone_verification_sms")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ParticipantPhoneVerificationSmsRepository")
 */
class ParticipantPhoneVerificationSms extends AbstractPhoneVerificationSms
{
    /**
     * @ORM\ManyToOne(targetEntity=Participant::class, inversedBy="participantPhoneVerificationSms")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    private Participant $participant;

    public function getParticipant(): Participant
    {
        return $this->participant;
    }

    public function setParticipant(Participant $participant): self
    {
        $this->participant = $participant;

        return $this;
    }
}
