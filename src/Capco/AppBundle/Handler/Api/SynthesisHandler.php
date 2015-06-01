<?php

namespace Capco\AppBundle\Handler\Api;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;

class SynthesisHandler
{
    protected $em;

    function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function getAll()
    {
        return $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->findAll();
    }

    public function createSynthesis(Synthesis $synthesis)
    {
        $this->em->persist($synthesis);
        $this->em->flush();

        $this->createElementsFromSource($synthesis);
    }

    public function createElementsFromSource(Synthesis $synthesis)
    {
        if ($synthesis->getSourceType() == "consultation_step" && null !== $synthesis->getConsultationStep()) {
            return $this->createElementsFromConsultationStep($synthesis, $synthesis->getConsultationStep());
        }
        return false;
    }

    public function createElementsFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        $currentElements = $synthesis->getElements();
        $currentElements = $currentElements ? $currentElements : array();
        $newElements = array();

        // Opinions
        $opinions = $consultationStep->getOpinions();
        foreach ($opinions as $opinion) {
            foreach ($currentElements as $element) {
                if ($this->elementIsRelated($element, $opinion)) {
                    break;
                }
            }
            $newElementFromOpinion = $this->createElementFromOpinion($opinion);
            $newElements[] = $newElementFromOpinion;

            // Arguments
            $arguments = $opinion->getArguments();
            foreach ($arguments as $argument) {
                foreach ($currentElements as $element) {
                    if ($this->elementIsRelated($element, $argument)) {
                        break;
                    }
                }
                $newElementFromArgument = $this->createElementFromArgument($argument);
                $newElementFromArgument->setParent($newElementFromOpinion);
                $newElements[] = $newElementFromArgument;
            }
        }

        foreach ($newElements as $element) {
            $element->setSynthesis($synthesis);
            $this->em->persist($element);
        }
        $this->em->flush();

        return true;
    }

    public function elementIsRelated($element, $object)
    {
        return $element->getLinkedDataClass() === get_class($object) && $element->getLinkedDataId() === $object->getId();
    }

    public function createElementFromOpinion(Opinion $opinion)
    {
        $element = new SynthesisElement();
        $element->setTitle($opinion->getTitle());
        $element->setBody($opinion->getBody());
        $element->setLinkedDataClass(get_class($opinion));
        $element->setLinkedDataId($opinion->getId());
        return $element;

    }

    public function createElementFromArgument(Argument $argument)
    {
        $element = new SynthesisElement();
        $element->setBody($argument->getBody());
        $element->setLinkedDataClass(get_class($argument));
        $element->setLinkedDataId($argument->getId());
        return $element;
    }


}
