<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
use JMS\Serializer\Annotation\Expose;

/**
 * Synthesis
 *
 * @ORM\Table(name="synthesis")
 * @ORM\Entity()
 * @Serializer\ExclusionPolicy("all")
 */
class Synthesis
{

    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="string", length=36)
     * @ORM\GeneratedValue(strategy="UUID")
     * @Expose
     */
    private $id;

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ConsultationStep")
     * @ORM\JoinColumn(name="consultation_step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Expose
     */
    private $consultationStep = null;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="synthesis", cascade={"persist", "remove"}, orphanRemoval=true)
     * @Expose
     */
    private $elements;

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getConsultationStep()
    {
        return $this->consultationStep;
    }

    /**
     * @param mixed $consultationStep
     */
    public function setConsultationStep($consultationStep)
    {
        $this->consultationStep = $consultationStep;
    }

    /**
     * @return mixed
     */
    public function getElements()
    {
        return $this->elements;
    }

    /**
     * @param mixed $element
     */
    public function addElement(SynthesisElement $element)
    {
        $this->elements[] = $element;
    }

    /**
     * @param mixed $element
     */
    public function removeElement(SynthesisElement $element)
    {
        $this->elements->removeElement($element);
    }
}
