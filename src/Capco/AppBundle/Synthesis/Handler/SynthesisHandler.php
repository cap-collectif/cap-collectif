<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor;

class SynthesisHandler
{
    protected $em;
    protected $consultationStepExtractor;

    function __construct(EntityManager $em, ConsultationStepExtractor $consultationStepExtractor)
    {
        $this->em = $em;
        $this->consultationStepExtractor = $consultationStepExtractor;
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

        return $synthesis;
    }

    public function createElementsFromSource(Synthesis $synthesis)
    {
        if ($synthesis->getSourceType() == "consultation_step") {
            return $this->consultationStepExtractor->createElementsFromConsultationStep($synthesis, $synthesis->getConsultationStep());
        }
        return false;
    }
}
