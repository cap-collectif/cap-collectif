<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Opinion
 *
 * @ORM\Table(name="opinion")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionRepository")
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
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Problem", inversedBy="Opinions")
     * @ORM\JoinColumn(name="problem_id", referencedColumnName="id", nullable=false)
     */
    private $Problem;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionType", inversedBy="Opinions")
     * @ORM\JoinColumn(name="opinion_type_id", referencedColumnName="id", nullable=false)
     */
    private $OpinionType;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Consultation", inversedBy="Opinions")
     */
    private $Consultation;

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
    public function getOpinionType()
    {
        return $this->OpinionType;
    }

    /**
     * @param mixed $OpinionType
     */
    public function setOpinionType($OpinionType)
    {
        $this->OpinionType = $OpinionType;
    }


    /**
     * @return mixed
     */
    public function getConsultation()
    {
        return $this->Consultation;
    }

    /**
     * @param mixed $Consultation
     */
    public function setConsultation($Consultation)
    {
        $this->Consultation = $Consultation;
    }

}
