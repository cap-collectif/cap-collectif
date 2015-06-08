<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Manager\LogManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;

class SynthesisElementHandler
{
    protected $em;
    protected $logManager;

    public function __construct(EntityManager $em, LogManager $logManager)
    {
        $this->em = $em;
        $this->logManager = $logManager;
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
}
