<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\BlameableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
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
class Group
{
    use UuidTrait;
    use TimestampableTrait;
    use SluggableTitleTrait;
    use BlameableTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "description"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="evaluers")
     */
    protected $evaluating;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Project", mappedBy="restrictedViewerGroups")
     */
    protected $projectsVisibleByTheGroup;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\UserGroup", mappedBy="group",  cascade={"persist", "remove"})
     */
    private $userGroups;

    public function __construct()
    {
        $this->userGroups = new ArrayCollection();
        $this->evaluating = new ArrayCollection();
        $this->projectsVisibleByTheGroup = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->title;
    }

    public function isEvaluating()
    {
        return $this->evaluating->count() > 0;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription(string $description)
    {
        $this->description = $description;

        return $this;
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
}
