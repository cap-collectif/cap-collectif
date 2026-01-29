<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=MailingListRepository::class)
 * @ORM\Table(name="mailing_list")
 */
class MailingList implements EntityInterface, Ownerable, CreatableInterface
{
    use CreatableTrait;
    use OwnerableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name;

    /**
     * @var Collection<int, MailingListUser>
     * @ORM\OneToMany(targetEntity=MailingListUser::class, mappedBy="mailingList", cascade={"persist", "remove"})
     */
    private Collection $mailingListUsers;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Project $project;

    /**
     * @ORM\Column(name="is_deletable", type="boolean", options={"default": true})
     */
    private bool $isDeletable = true;

    /**
     * @ORM\OneToMany(targetEntity=EmailingCampaign::class, mappedBy="mailingList", orphanRemoval=true)
     */
    private Collection $emailingCampaigns;

    /**
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTime $createdAt;

    public function __construct()
    {
        $this->mailingListUsers = new ArrayCollection();
        $this->project = null;
        $this->emailingCampaigns = new ArrayCollection();
        $this->createdAt = new \DateTime();
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

    public function getMailingListUsers(): Collection
    {
        return $this->mailingListUsers;
    }

    public function addMailingListUser(MailingListUser $mailingListUser): self
    {
        if (!$this->mailingListUsers->contains($mailingListUser)) {
            $this->mailingListUsers->add($mailingListUser);
        }

        return $this;
    }

    public function removeMailingListUser(MailingListUser $mailingListUser): self
    {
        $this->mailingListUsers->removeElement($mailingListUser);

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

    public function isDeletable(): bool
    {
        return $this->isDeletable;
    }

    public function setIsDeletable(bool $isDeletable): self
    {
        $this->isDeletable = $isDeletable;

        return $this;
    }

    public function getEmailingCampaigns(): Collection
    {
        return $this->emailingCampaigns;
    }

    public function addEmailingCampaign(EmailingCampaign $emailingCampaign): self
    {
        if (!$this->emailingCampaigns->contains($emailingCampaign)) {
            $this->emailingCampaigns[] = $emailingCampaign;
            $emailingCampaign->setMailingList($this);
        }

        return $this;
    }

    public function removeEmailingCampaign(EmailingCampaign $emailingCampaign): self
    {
        if ($this->emailingCampaigns->contains($emailingCampaign)) {
            $this->emailingCampaigns->removeElement($emailingCampaign);
            if ($emailingCampaign->getMailingList() === $this) {
                $emailingCampaign->setMailingList(null);
            }
        }

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
