<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Problem
 *
 * @ORM\Table(name="problem")
 * @ORM\Entity
 */
class Problem extends Contribution
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
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProblemType", inversedBy="Problems")
     * @ORM\JoinColumn(name="problemType_id", referencedColumnName="id", nullable=false)
     */
    private $ProblemType;

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
    public function getProblemType()
    {
        return $this->ProblemType;
    }

    /**
     * @param mixed $ProblemType
     */
    public function setProblemType($ProblemType)
    {
        $this->ProblemType = $ProblemType;
    }

}
