<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Symfony\Component\Validator\Constraints as Assert;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;

use JMS\Serializer\Annotation as Serializer;
use JMS\Serializer\Annotation\Expose;
use JMS\Serializer\Annotation\Groups;
use JMS\Serializer\Annotation\Type;

/**
 * SynthesisElementDivision
 *
 * @Serializer\ExclusionPolicy("all")
 */
class SynthesisElementDivision
{
    /**
     * @Type("ArrayCollection<Capco\AppBundle\Entity\Synthesis\SynthesisElement>")
     * @Expose()
     */
    private $elements;

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
