<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Symfony\Component\Validator\Constraints as Assert;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

use JMS\Serializer\Annotation as Serializer;
use JMS\Serializer\Annotation\Expose;
use JMS\Serializer\Annotation\Groups;
use JMS\Serializer\Annotation\Type;

/**
 * SynthesisDivision
 *
 * @ORM\Table(name="synthesis_division")
 * @ORM\Entity()
 * @Gedmo\Loggable()
 *
 * @Serializer\ExclusionPolicy("all")
 */
class SynthesisDivision
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     * @Expose
     */
    private $id;

    /**
     * @Expose()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\SynthesisElement", cascade={"persist"})
     * @ORM\JoinColumn(name="original_element_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $originalElement;

    /**
     * @Type("ArrayCollection<Capco\AppBundle\Entity\Synthesis\SynthesisElement>")
     * @Expose()
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
        return $this->elements[] = $element;
    }

    /**
     * @return mixed
     */
    public function removeElement(SynthesisElement $element)
    {
        return $this->elements->removeElement($element);
    }

    /**
     * @param mixed $elements
     */
    public function setElements($elements)
    {
        $this->elements = $elements;
    }


}
