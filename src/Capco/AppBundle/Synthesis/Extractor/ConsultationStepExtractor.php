<?php

namespace Capco\AppBundle\Synthesis\Extractor;

class ConsultationStepExtractor
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

    public function createSynthesisFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        $synthesis->setConsultationStep($consultationStep);
        $synthesis->setSourceType('consultation_step');
        return $this->createSynthesis($synthesis);
    }

    public function createSynthesis(Synthesis $synthesis)
    {
        $this->em->persist($synthesis);
        $this->em->flush();

        $synthesis = $this->createElementsFromSource($synthesis);

        return $synthesis;
    }

    public function createElementsFromSource(Synthesis $synthesis)
    {
        if ($synthesis->getSourceType() === "consultation_step" && null !== $synthesis->getConsultationStep()) {
            return $this->createElementsFromConsultationStep($synthesis, $synthesis->getConsultationStep());
        }
        return $synthesis;
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
            $synthesis->addElement($element);
            $this->em->persist($element);
        }

        $this->em->persist($synthesis);
        $this->em->flush();

        return $synthesis;
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
