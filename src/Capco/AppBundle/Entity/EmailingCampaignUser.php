<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\EmailingCampaignUserRepository;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=EmailingCampaignUserRepository::class)
 * @ORM\Table(name="emailing_campaign_user")
 */
class EmailingCampaignUser implements EntityInterface
{
    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity=EmailingCampaign::class, inversedBy="emailingCampaignUsers")
     * @ORM\JoinColumn(nullable=false, name="emailing_campaign_id")
     */
    private EmailingCampaign $emailingCampaign;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="emailingCampaignUsers")
     * @ORM\JoinColumn(nullable=false, name="user_id")
     */
    private User $user;

    /**
     * @ORM\Column(name="sent_at", type="datetime", nullable=true)
     */
    private ?\DateTime $sentAt = null;

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
}
