<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ConsultationStep
 *
 * @ORM\Table(name="consultation_step")
 * @ORM\Entity
 */
class ConsultationStep extends Step
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Problem", cascade={"persist"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $problem;

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getProblem()
    {
        return $this->problem;
    }

    /**
     * @param mixed $problem
     */
    public function setProblem($problem)
    {
        $this->problem = $problem;
    }

}
