<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\PositionableTrait;

/**
 * Class ProjectAbstractStep
 * Association between project and steps.
 *
 * @ORM\Entity()
 * @ORM\Table(name="project_abstractstep")
 */
class ProjectAbstractStep
{
    use PositionableTrait;

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="steps", cascade={"persist"})
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     **/
    protected $project;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\AbstractStep", inversedBy="projectAbstractStep", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     **/
    protected $step;

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    public function __toString()
    {
        if ($this->step) {
            return $this->step->__toString();
        }

        return 'undefined step';
    }

    /**
     * Set project.
     *
     * @param \Capco\AppBundle\Entity\Project $project
     *
     * @return ProjectAbstractStep
     */
    public function setProject(Project $project)
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

    /**
     * Set step.
     *
     * @param \Capco\AppBundle\Entity\AbstractStep $step
     *
     * @return ProjectAbstractStep
     */
    public function setStep(AbstractStep $step)
    {
        $this->step = $step;

        return $this;
    }

    /**
     * Get step.
     *
     * @return \Capco\AppBundle\Entity\AbstractStep
     */
    public function getStep()
    {
        return $this->step;
    }
}
