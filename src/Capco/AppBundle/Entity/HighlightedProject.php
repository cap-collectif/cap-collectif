<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedProject.
 *
 * @ORM\Entity()
 */
class HighlightedProject extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Project")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $project;

    /**
     * Gets the value of project.
     *
     * @return mixed
     */
    public function getProject()
    {
        return $this->project;
    }

    /**
     * Sets the value of project.
     *
     * @param mixed $project the project
     *
     * @return self
     */
    public function setProject(Project $project)
    {
        $this->project = $project;

        return $this;
    }

    public function getAssociatedFeatures()
    {
        return [];
    }

    public function getType()
    {
        return 'project';
    }

    public function getContent()
    {
        return $this->project;
    }

    public function getMedia()
    {
        return $this->project->getCover();
    }
}
