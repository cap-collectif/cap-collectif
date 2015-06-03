<?php

namespace Capco\AppBundle\Synthesis\Extractor;

class ConsultationStepExtractor
{

    public function createElementsFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        $currentElements = $synthesis->getElements();
        $currentElements = $currentElements ? $currentElements : array();
        $newElements = array();

        // Opinions
        $opinions = $consultationStep->getOpinions();
        foreach ($opinions as $opinion) {
            foreach ($currentElements as $element) {
                if (!$this->isElementRelated($element, $opinion)) {
                    continue;
                }
            }
            $newElementFromOpinion = $this->createElementFromOpinion($opinion);
            $newElements[] = $newElementFromOpinion;

            // Arguments
            $arguments = $opinion->getArguments();
            foreach ($arguments as $argument) {
                foreach ($currentElements as $element) {
                    if ($this->isElementRelated($element, $argument)) {
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

    public function isElementRelated($element, $object)
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