<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;

/**
 * Project author.
 *
 * @ORM\Table(name="project_author")
 * @ORM\Entity
 */
class ProjectAuthor
{
    use TimestampableTrait;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $user;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project")
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

    /**
     * Set project.
     *
     * @param \Capco\AppBundle\Entity\Project $project
     *
     * @return ProjectAbstractStep
     */
    public function setProject(Project $project): self
    {
        $this->project = $project;

        return $this;
    }

    /**
     * Get project.
     *
     * @return \Capco\AppBundle\Entity\Project
     */
    public function getProject()
    {
        return $this->project;
    }
}
