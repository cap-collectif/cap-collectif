<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
use Capco\AppBundle\Manager\LogManager;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor;

class SynthesisHandler
{
    protected $em;
    protected $consultationStepExtractor;
    protected $logManager;

    function __construct(EntityManager $em, ConsultationStepExtractor $consultationStepExtractor, LogManager $logManager)
    {
        $this->em = $em;
        $this->consultationStepExtractor = $consultationStepExtractor;
        $this->logManager = $logManager;
    }

    public function getAllSyntheses()
    {
        return $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->findAll();
    }

    public function createOrUpdateSynthesis(Synthesis $synthesis)
    {
        $this->em->persist($synthesis);
        $this->em->flush();

        $this->createOrUpdateElementsFromSource($synthesis);

        return $synthesis;
    }

    public function createSynthesisFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        $synthesis->setConsultationStep($consultationStep);
        $synthesis->setSourceType('consultation_step');
        return $this->createSynthesis($synthesis);
    }

    public function getAllElementsFromSynthesis(Synthesis $synthesis)
    {
        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->findBy(array(
            'synthesis' => $synthesis,
        ));
    }

    public function getNewElementsFromSynthesis(Synthesis $synthesis)
    {
        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->findBy(array(
            'synthesis' => $synthesis,
            'archived' => false,
        ));
    }

    public function createOrUpdateElementInSynthesis(SynthesisElement $element, Synthesis $synthesis)
    {
        $element->setSynthesis($synthesis);

        $this->em->persist($element);
        $this->em->flush();

        return $element;
    }

    public function createDivisionFromElementInSynthesis(SynthesisDivision $division, SynthesisElement $element, Synthesis $synthesis)
    {
        foreach ($division->getElements() as $el) {
            $el->setLinkedDataClass($element->getLinkedDataClass());
            $el->setLinkedDataId($element->getLinkedDataId());
            $el->setSynthesis($synthesis);
            $el->setParent($element->getParent());
            $el->setNotation($element->getNotation());
            $el->setOriginalDivision($division);
            $this->em->persist($el);
        }

        $division->setOriginalElement($element);
        $this->em->persist($division);

        $this->em->remove($element);
        $this->em->flush();

        return $division;
    }

    public function getLogsForElement(SynthesisElement $element)
    {
        return $this->logManager->getLogEntries($element);
    }

    public function createOrUpdateElementsFromSource(Synthesis $synthesis)
    {
        if ($synthesis->getSourceType() == "consultation_step") {
            return $this->consultationStepExtractor->createOrUpdateElementsFromConsultationStep($synthesis, $synthesis->getConsultationStep());
        }
        return $synthesis;
    }
}
