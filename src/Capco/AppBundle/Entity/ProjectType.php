<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Project Type.
 *
 * @ORM\Table(name="project_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectTypeRepository")
 */
class ProjectType implements \Stringable
{
    use IdTrait;

    /**
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @ORM\Column(name="slug", type="text")
     */
    private $slug;

    /**
     * @ORM\Column(name="color", type="string", length=25)
     */
    private $color;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Project", mappedBy="projectType", cascade={"persist"})
     */
    private $projects;

    public function __toString(): string
    {
        return (string) ($this->getId() ? $this->getTitle() : 'New project type');
    }

    public function getTitle()
    {
        return $this->title;
    }

    public function setTitle(?string $title = null): self
    {
        $this->title = $title;

        return $this;
    }

    public function getSlug()
    {
        return $this->slug;
    }

    public function setSlug(?string $slug = null): self
    {
        $this->slug = $slug;

        return $this;
    }

    public function getColor()
    {
        return $this->color;
    }

    public function setColor(?string $color = null): self
    {
        $this->color = $color;

        return $this;
    }

    public function getProjects(): Collection
    {
        return $this->projects;
    }

    public function setProjects($projects = null): self
    {
        $this->projects = $projects;

        return $this;
    }

    public function addProject(Project $project): self
    {
        if (!$this->projects->contains($project)) {
            $this->projects[] = $project;
            $project->setProjectType($this);
        }

        return $this;
    }
}
