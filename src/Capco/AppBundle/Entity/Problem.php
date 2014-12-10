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
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Consultation", inversedBy="Problems")
     * @ORM\JoinColumn(name="consultation_id", referencedColumnName="id", nullable=false)
     */
    private $Consultation;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="Problem",  cascade={"persist", "remove"})
     */
    private $Opinions;

    function __construct()
    {
        $this->Opinions = new ArrayCollection();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New problem";
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

    /**
     * @return mixed
     */
    public function getOpinions()
    {
        return $this->Opinions;
    }

    /**
     * @param \Capco\AppBundle\Entity\Opinion $opinion
     *
     * @return Consultation
     */
    public function addOpinion(Opinion $opinion)
    {
        $this->Opinions[] = $opinion;

        return $this;
    }

    /**
     *
     * @param \Capco\AppBundle\Entity\Opinion $opinion
     */
    public function removeOpinion(Opinion $opinion)
    {
        $this->Opinions->removeElement($opinion);
    }

}
