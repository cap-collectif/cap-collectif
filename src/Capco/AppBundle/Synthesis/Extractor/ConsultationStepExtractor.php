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

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function createOrUpdateElementsFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        if ($consultationStep === null) {
            return false;
        }

        $previousElements = $synthesis->getElements();

        // Opinions
        $opinions = $consultationStep->getOpinions();
        foreach ($opinions as $opinion) {
            $elementFromOpinion = null;
            foreach ($previousElements as $element) {
                if ($this->isElementRelated($element, $opinion)) {
                    $elementFromOpinion = $element;
                    if ($this->elementIsOutdated($elementFromOpinion, $opinion)) {
                        $elementFromOpinion = $this->updateElementFromOpinion($elementFromOpinion, $opinion);
                    }
                    break;
                }
            }

            if (null === $elementFromOpinion) {
                $elementFromOpinion = $this->createElementFromOpinion($opinion);
                $synthesis->addElement($elementFromOpinion);
            }

            // Arguments
            $arguments = $opinion->getArguments();
            foreach ($arguments as $argument) {
                $elementFromArgument = null;
                foreach ($previousElements as $element) {
                    if ($this->isElementRelated($element, $argument)) {
                        $elementFromArgument = $element;
                        if ($this->elementIsOutdated($elementFromArgument, $argument)) {
                            $elementFromArgument = $this->updateElementFromArgument($elementFromArgument, $argument);
                        }
                        break;
                    }
                }
                if (null === $elementFromArgument) {
                    $elementFromArgument = $this->createElementFromArgument($argument);
                    $elementFromArgument->setParent($elementFromOpinion);
                    $synthesis->addElement($elementFromArgument);
                }
            }
        }

        $this->em->flush();

        return $synthesis;
    }

    public function isElementRelated(SynthesisElement $element, $object)
    {
        return $element->getLinkedDataClass() === get_class($object) && $element->getLinkedDataId() == $object->getId();
    }

    public function elementIsOutdated(SynthesisElement $element, $object)
    {
        return $object->getUpdatedAt() > $element->getLinkedDataLastUpdate();
    }

    public function createElementFromOpinion(Opinion $opinion)
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(get_class($opinion));
        $element->setLinkedDataId($opinion->getId());

        return $this->updateElementFromOpinion($element, $opinion);
    }

    public function updateElementFromOpinion(SynthesisElement $element, Opinion $opinion)
    {
        $element->setTitle($opinion->getTitle());
        $element->setBody($opinion->getBody());

        // Update last modified and archive status
        $element->setLinkedDataLastUpdate($opinion->getUpdatedAt());
        $element->setArchived(false);

        return $element;
    }

    public function createElementFromArgument(Argument $argument)
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(get_class($argument));
        $element->setLinkedDataId($argument->getId());

        return $this->updateElementFromArgument($element, $argument);
    }

    public function updateElementFromArgument(SynthesisElement $element, Argument $argument)
    {
        $element->setBody($argument->getBody());

        // Update last modified and archive status
        $element->setLinkedDataLastUpdate($argument->getUpdatedAt());
        $element->setArchived(false);

        return $element;
    }
}
