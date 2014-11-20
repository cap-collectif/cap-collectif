<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Opinion
 *
 * @ORM\Table(name="opinion")
 * @ORM\Entity
 */
class Opinion extends Contribution
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Problem")
     * @ORM\JoinColumn(name="problem_id", referencedColumnName="id", nullable=false)
     */
    private $Problem;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionType", mappedBy="Opinion")
     */
    private $OpinionTypes;

    function __construct()
    {
        $this->OpinionTypes = new ArrayCollection();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New opinion";
        }
    }

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
        return $this->Problem;
    }

    /**
     * @param mixed $Problem
     */
    public function setProblem($Problem)
    {
        $this->Problem = $Problem;
    }

    /**
     * @return mixed
     */
    public function getOpinionTypes()
    {
        return $this->OpinionTypes;
    }

    /**
     * @param OpinionType $OpinioType
     * @return $this
     */
    public function addOpinionType(OpinionType $opinionType)
    {
        $this->OpinionTypes[] = $opinionType;

        return $this;
    }

    /**
     * @param OpinionType $OpinioType
     */
    public function removeOpinionType(OpinionType $opinionType)
    {
        $this->OpinionTypes->removeElement($opinionType);
    }
}
