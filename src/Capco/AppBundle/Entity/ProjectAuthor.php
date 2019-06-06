<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\TimestampableTrait;

/**
 * Project author.
 *
 * @ORM\Table(name="project_author")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectAuthorRepository")
 */
class ProjectAuthor
{
    use TimestampableTrait, UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="authors", cascade="persist")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $project;

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function setProject(Project $project): self
    {
        $this->project = $project;

        $project->addAuthor($this);

        return $this;
    }

    public function getProject(): Project
    {
        return $this->project;
    }
}
