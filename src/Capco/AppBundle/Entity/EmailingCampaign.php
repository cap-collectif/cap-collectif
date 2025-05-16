<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=EmailingCampaignRepository::class)
 * @ORM\Table(name="emailing_campaign")
 */
class EmailingCampaign implements EntityInterface, Ownerable, CreatableInterface
{
    use CreatableTrait;
    use OwnerableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name;

    /**
     * @ORM\Column(type="string", name="sender_email", length=255)
     */
    private string $senderEmail;

    /**
     * @ORM\Column(type="string", name="sender_name", length=255)
     */
    private string $senderName;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $object = '';

    /**
     * @ORM\Column(type="text")
     */
    private string $content = '';

    /**
     * @ORM\Column(name="unlayer_conf", type="json", nullable=true)
     */
    private ?string $unlayerConf = null;

    /**
     * @ORM\ManyToOne(targetEntity=MailingList::class, inversedBy="emailingCampaigns")
     * @ORM\JoinColumn(nullable=true, name="mailing_list_id")
     */
    private ?MailingList $mailingList = null;

    /**
     * @ORM\ManyToOne(targetEntity=Group::class, inversedBy="emailingCampaigns")
     * @ORM\JoinColumn(nullable=true, name="emailing_group")
     */
    private ?Group $emailingGroup = null;

    /**
     * @ORM\Column(type="string", name="mailing_internal", length=255, nullable=true)
     */
    private ?string $mailingInternal = null;

    /**
     * @ORM\ManyToOne(targetEntity=Project::class, inversedBy="emailingCampaigns")
     * @ORM\JoinColumn(nullable=true, name="project_id")
     */
    private ?Project $project = null;

    /**
     * @ORM\Column(type="datetime", name="send_at", nullable=true)
     */
    private ?\DateTime $sendAt = null;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $status = EmailingCampaignStatus::DRAFT;

    /**
     * @ORM\OneToMany(targetEntity=EmailingCampaignUser::class, mappedBy="emailingCampaign", orphanRemoval=true)
     */
    private Collection $emailingCampaignUsers;

    public function __construct()
    {
        $this->emailingCampaignUsers = new ArrayCollection();
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getSenderEmail(): ?string
    {
        return $this->senderEmail;
    }

    public function setSenderEmail(string $senderEmail): self
    {
        $this->senderEmail = $senderEmail;

        return $this;
    }

    public function getSenderName(): ?string
    {
        return $this->senderName;
    }

    public function setSenderName(string $senderName): self
    {
        $this->senderName = $senderName;

        return $this;
    }

    public function getObject(): string
    {
        return $this->object;
    }

    public function setObject(string $object): self
    {
        $this->object = $object;

        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getUnlayerConf(): ?string
    {
        return $this->unlayerConf;
    }

    public function setUnlayerConf(?string $unlayerConf): void
    {
        $this->unlayerConf = $unlayerConf;
    }

    public function getMailingList(): ?MailingList
    {
        return $this->mailingList;
    }

    public function setMailingList(?MailingList $mailingList): self
    {
        $this->mailingList = $mailingList;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): self
    {
        $this->project = $project;

        return $this;
    }

    public function getMailingInternal(): ?string
    {
        return $this->mailingInternal;
    }

    public function setMailingInternal(?string $mailingInternal): self
    {
        if ($mailingInternal) {
            EmailingCampaignInternalList::checkIsValid($mailingInternal);
        }
        $this->mailingInternal = $mailingInternal;

        return $this;
    }

    public function getSendAt(): ?\DateTimeInterface
    {
        return $this->sendAt;
    }

    public function setSendAt(?\DateTimeInterface $sendAt): self
    {
        $this->sendAt = $sendAt;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        EmailingCampaignStatus::checkIsValid($status);
        $this->status = $status;

        return $this;
    }

    public function isEditable(): bool
    {
        return \in_array($this->status, EmailingCampaignStatus::EDITABLE);
    }

    public function hasReceipt(): bool
    {
        return $this->mailingList
            || $this->mailingInternal
            || $this->emailingGroup
            || $this->project;
    }

    public function isComplete(): bool
    {
        return $this->senderName
            && $this->senderEmail
            && '' !== $this->object
            && '' !== $this->content;
    }

    public function canBeSent(): bool
    {
        return $this->isEditable() && $this->isComplete() && $this->hasReceipt();
    }

    public function archive(): void
    {
        $this->setStatus(EmailingCampaignStatus::ARCHIVED);
    }

    public function getEmailingGroup(): ?Group
    {
        return $this->emailingGroup;
    }

    public function setEmailingGroup(?Group $emailingGroup): self
    {
        $this->emailingGroup = $emailingGroup;

        return $this;
    }

    public function getEmailingCampaignUsers(): Collection
    {
        return $this->emailingCampaignUsers;
    }

    public function addEmailingCampaignUser(EmailingCampaignUser $emailingCampaignUser): self
    {
        if (!$this->emailingCampaignUsers->contains($emailingCampaignUser)) {
            $this->emailingCampaignUsers[] = $emailingCampaignUser;
            $emailingCampaignUser->setEmailingCampaign($this);
        }

        return $this;
    }

    public function removeEmailingCampaignUser(EmailingCampaignUser $emailingCampaignUser): self
    {
        if ($this->emailingCampaignUsers->removeElement($emailingCampaignUser)) {
            // set the owning side to null (unless already changed)
            if ($emailingCampaignUser->getEmailingCampaign() === $this) {
                $emailingCampaignUser->setEmailingCampaign(null);
            }
        }

        return $this;
    }
}
