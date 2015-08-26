<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\ORM\Mapping as ORM;

/**
 * SynthesisDivision.
 *
 * @ORM\Table(name="synthesis_division")
 * @ORM\Entity()
 */
class SynthesisDivision
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    private $id;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="division", cascade={"persist"}, orphanRemoval=true)
     * @ORM\JoinColumn(name="original_element_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $originalElement;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", mappedBy="originalDivision", cascade={"persist"})
     */
    private $elements;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getOriginalElement()
    {
        return $this->originalElement;
    }

    /**
     * @param mixed $originalElement
     */
    public function setOriginalElement($originalElement)
    {
        $this->originalElement = $originalElement;

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
     * @return mixed
     */
    public function addElement(SynthesisElement $element)
    {
        $element->setOriginalDivision($this);
        $this->elements[] = $element;

        return $this;
    }

    /**
     * @return mixed
     */
    public function removeElement(SynthesisElement $element)
    {
        $this->elements->removeElement($element);
        $element->setOriginalDivision(null);

        return $this;
    }

    /**
     * @param mixed $elements
     */
    public function setElements($elements)
    {
        $this->elements = $elements;
        foreach ($elements as $el) {
            $el->setOriginalDivision($this);
        }

        return $this;
    }
}
