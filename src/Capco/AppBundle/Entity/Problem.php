<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Problem
 *
 * @ORM\Table(name="problem")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProblemRepository")
 */
class Problem extends Contribution
{
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

}
