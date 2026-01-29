<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Mailer\Enum\EmailingCampaignUserStatus;
use Capco\AppBundle\Repository\EmailingCampaignUserRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=EmailingCampaignUserRepository::class)
 * @ORM\Table(name="emailing_campaign_user")
 */
class EmailingCampaignUser implements EntityInterface
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity=EmailingCampaign::class, inversedBy="emailingCampaignUsers")
     * @ORM\JoinColumn(nullable=false, name="emailing_campaign_id")
     */
    private EmailingCampaign $emailingCampaign;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="emailingCampaignUsers")
     * @ORM\JoinColumn(nullable=true, name="user_id")
     */
    private ?User $user = null;

    /**
     * @ORM\ManyToOne(targetEntity=Participant::class, inversedBy="emailingCampaignUsers")
     * @ORM\JoinColumn(nullable=true, name="participant_id")
     */
    private ?Participant $participant = null;

    /**
     * @ORM\Column(name="sent_at", type="datetime", nullable=true)
     */
    private ?\DateTime $sentAt = null;

    /**
     * @ORM\Column(name="status", type="string", length=50, nullable=true)
     */
    private ?string $status = null;

    public function getEmailingCampaign(): EmailingCampaign
    {
        return $this->emailingCampaign;
    }

    public function setEmailingCampaign(EmailingCampaign $emailingCampaign): self
    {
        $this->emailingCampaign = $emailingCampaign;

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

    public function getCreatedAt(): \DateTime
    {
        return $this->sentAt;
    }

    public function setSentAt(\DateTime $sentAt): self
    {
        $this->sentAt = $sentAt;

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

    public function getStatus(): ?EmailingCampaignUserStatus
    {
        return EmailingCampaignUserStatus::tryFrom($this->status);
    }

    public function setStatus(?EmailingCampaignUserStatus $status): self
    {
        $this->status = $status->value;

        return $this;
    }

    public function getContributor(): ContributorInterface
    {
        return $this->user ?? $this->participant;
    }
}
