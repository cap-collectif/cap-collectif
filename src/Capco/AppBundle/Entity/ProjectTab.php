<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ProjectTabType;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectTabRepository")
 * @ORM\Table(
 *     name="project_tab",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(name="project_tab_project_slug_unique", columns={"project_id", "slug"})
 *     }
 * )
 * @ORM\InheritanceType("JOINED")
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({
 *     ProjectTabType::PRESENTATION = "Capco\AppBundle\Entity\ProjectTabPresentation",
 *     ProjectTabType::NEWS = "Capco\AppBundle\Entity\ProjectTabNews",
 *     ProjectTabType::EVENTS = "Capco\AppBundle\Entity\ProjectTabEvents",
 *     ProjectTabType::CUSTOM = "Capco\AppBundle\Entity\ProjectTabCustom"
 * })
 */
abstract class ProjectTab implements EntityInterface, \Stringable
{
    use PositionableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="title", type="string", length=255, nullable=false)
     * @Assert\NotBlank()
     * @Assert\NotNull()
     */
    protected string $title;

    /**
     * @ORM\Column(name="slug", type="string", length=255, nullable=false)
     * @Assert\NotBlank()
     * @Assert\NotNull()
     */
    protected string $slug;

    /**
     * @ORM\Column(name="enabled", type="boolean")
     */
    protected bool $enabled = false;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected ?\DateTimeInterface $createdAt = null;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="tabs", cascade={"persist"})
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     */
    protected ?Project $project = null;

    public function __toString(): string
    {
        return $this->title ?? 'New project tab';
    }

    abstract public function getType(): string;

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(Project $project): self
    {
        $this->project = $project;

        return $this;
    }
}
