<?php

namespace Capco\AppBundle\Synthesis\Extractor;

use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;

class ConsultationStepExtractor
{
    protected $em;

    function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function createOrUpdateElementsFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        if ($consultationStep === null) {
            return false;
        }

        $currentElements = $synthesis->getElements();
        $currentElements = $currentElements ? $currentElements : array();
        $newElements = array();

        // Opinions
        $opinions = $consultationStep->getOpinions();
        foreach ($opinions as $opinion) {
            $elementFromOpinion = null;
            foreach ($currentElements as $element) {
                if ($this->isElementRelated($element, $opinion)) {
                    $elementFromOpinion = $element;
                    break;
                }
            }

            if (null === $elementFromOpinion) {
                $elementFromOpinion = $this->createElementFromOpinion($opinion);
                $newElements[] = $elementFromOpinion;
            }

            // Arguments
            $arguments = $opinion->getArguments();
            foreach ($arguments as $argument) {
                $elementFromArgument = null;
                foreach ($currentElements as $element) {
                    if ($this->isElementRelated($element, $argument)) {
                        $elementFromArgument = $element;
                        break;
                    }
                }
                if (null === $elementFromArgument) {
                    $elementFromArgument = $this->createElementFromArgument($argument);
                    $elementFromArgument->setParent($elementFromOpinion);
                    $newElements[] = $elementFromArgument;
                }
            }
        }

        foreach ($newElements as $element) {
            $element->setSynthesis($synthesis);
            $synthesis->addElement($element);
            $this->em->persist($element);
        }

        $this->em->persist($synthesis);
        $this->em->flush();

        return $synthesis;
    }

    public function isElementRelated(SynthesisElement $element, $object)
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
