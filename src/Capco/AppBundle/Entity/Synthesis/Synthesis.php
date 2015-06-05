<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use JMS\Serializer\Annotation as Serializer;
use Hateoas\Configuration\Annotation as Hateoas;

/**
 * Synthesis
 *
 * @ORM\Table(name="synthesis")
 * @ORM\Entity()
 * @ORM\HasLifecycleCallbacks()
 * @Serializer\ExclusionPolicy("all")
 * @Hateoas\Relation(
 *      "self",
 *      href = @Hateoas\Route(
 *          "get_synthesis",
 *          parameters = {
 *              "id" = "expr(object.getId())"
 *          }
 *      )
 * )
 * @Hateoas\Relation(
 *      "elements",
 *      href = @Hateoas\Route(
 *          "get_synthesis_elements",
 *          parameters = {
 *              "id" = "expr(object.getId())"
 *          }
 *      )
 * )
 * @Hateoas\Relation(
 *      name = "elements",
 *      embedded = @Hateoas\Embedded(
 *          "expr(object.getElements())",
 *          exclusion = @Hateoas\Exclusion(excludeIf = "expr(!object.getElements() or object.getElements().isEmpty())")
 *      )
 * )
 */
class Synthesis
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     * @Serializer\Expose
     */
    private $id;

    /**
     * @ORM\Column(name="enabled", type="boolean")
     * @Serializer\Expose
     * @Serializer\Groups({"SynthesisDetails"})
     */
    private $enabled = false;

    /**
     * @var string
     * @ORM\Column(name="source_type", type="string", length=255)
     * @Assert\Choice(choices = {"consultation_step", "file", "none"})
     */
    private $sourceType = "none";

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ConsultationStep")
     * @ORM\JoinColumn(name="consultation_step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Serializer\Type("Capco\AppBundle\Entity\ConsultationStep")
     */
    private $consultationStep = null;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="synthesis", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $elements;

    public function __construct()
    {
        $this->elements = new ArrayCollection();
    }

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
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return mixed
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param mixed $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
        return $this;
    }

    /**
     * @return string
     */
    public function getSourceType()
    {
        return $this->sourceType;
    }

    /**
     * @param string $sourceType
     */
    public function setSourceType($sourceType)
    {
        $this->sourceType = $sourceType;
        return $this;
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
        return $this;
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
        if (!$this->elements->contains($element)) {
            $this->elements[] = $element;
            $element->setSynthesis($this);
        }
        return $this;
    }

    /**
     * @param mixed $element
     */
    public function removeElement(SynthesisElement $element)
    {
        $this->elements->removeElement($element);
        return $this;
    }

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PrePersist
     */
    public function init()
    {
        if ($this->sourceType === null) {
            $this->sourceType = 'none';
        }
        if ($this->elements === null) {
            $this->elements = new ArrayCollection();
        }
    }
}
