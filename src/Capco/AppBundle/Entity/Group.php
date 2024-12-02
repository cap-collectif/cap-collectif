<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\BlameableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\Text\DescriptionTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="user_group")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\GroupRepository")
 */
class Group implements \Stringable
{
    use BlameableTrait;
    use DescriptionTrait;
    use SluggableTitleTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "description"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected ?\DateTimeInterface $updatedAt;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="evaluers")
     */
    protected $evaluating;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", mappedBy="restrictedViewerGroups")
     */
    protected $projectsVisibleByTheGroup;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\UserGroup", mappedBy="group",  cascade={"persist", "remove"})
     */
    private $userGroups;

    /**
     * @ORM\Column(type="boolean", name="is_deletable", options={"default": true})
     */
    private bool $isDeletable = true;

    /**
     * @ORM\ManyToMany(targetEntity=UserInvite::class, mappedBy="groups")
     */
    private $userInvites;

    /**
     * @ORM\OneToMany(targetEntity=EmailingCampaign::class, mappedBy="emailingGroup", orphanRemoval=true)
     */
    private Collection $emailingCampaigns;

    public function __construct()
    {
        $this->userGroups = new ArrayCollection();
        $this->evaluating = new ArrayCollection();
        $this->projectsVisibleByTheGroup = new ArrayCollection();
        $this->updatedAt = new \DateTime();
        $this->userInvites = new ArrayCollection();
    }

    public function __toString(): string
    {
        return (string) $this->title;
    }

    public function isEvaluating()
    {
        return $this->evaluating->count() > 0;
    }

    public function getUserGroups(): Collection
    {
        return $this->userGroups;
    }

    public function setUserGroups(ArrayCollection $userGroups): self
    {
        $this->userGroups = $userGroups;

        return $this;
    }

    public function addUserGroup(UserGroup $userGroup): self
    {
        if (!$this->userGroups->contains($userGroup)) {
            $this->userGroups->add($userGroup);
        }

        return $this;
    }

    public function removeUserGroup(UserGroup $userGroup): self
    {
        $this->userGroups->removeElement($userGroup);

        return $this;
    }

    /**
     * Useful for sonata admin.
     */
    public function countUserGroups(): int
    {
        return $this->userGroups->count();
    }

    /**
     * Useful for sonata admin.
     */
    public function titleInfo(): array
    {
        return [
            'id' => $this->getId(),
            'title' => $this->getTitle(),
            'description' => $this->getDescription(),
        ];
    }

    public function getProjectsVisibleByTheGroup(): Collection
    {
        return $this->projectsVisibleByTheGroup;
    }

    public function setProjectsVisibleByTheGroup(Collection $projectsVisibleByTheGroup): self
    {
        $this->projectsVisibleByTheGroup = $projectsVisibleByTheGroup;

        return $this;
    }

    public function addProjectsVisibleByTheGroup(Project $project): self
    {
        $this->projectsVisibleByTheGroup->add($project);

        return $this;
    }

    public function removeProjectsVisibleByTheGroup(Project $project): self
    {
        if ($this->projectsVisibleByTheGroup->get($project)) {
            $this->projectsVisibleByTheGroup->remove($project);
        }

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

    /**
     * @return Collection|UserInvite[]
     */
    public function getUserInvites(): Collection
    {
        return $this->userInvites;
    }

    public function addUserInvite(UserInvite $userInvite): self
    {
        if (!$this->userInvites->contains($userInvite)) {
            $this->userInvites[] = $userInvite;
            $userInvite->addGroup($this);
        }

        return $this;
    }

    public function removeUserInvite(UserInvite $userInvite): self
    {
        if ($this->userInvites->removeElement($userInvite)) {
            $userInvite->removeGroup($this);
        }

        return $this;
    }

    public function getEmailingCampaigns(): Collection
    {
        return $this->emailingCampaigns;
    }

    public function setEmailingCampaigns(Collection $emailingCampaigns): self
    {
        $this->emailingCampaigns = $emailingCampaigns;

        return $this;
    }
}
