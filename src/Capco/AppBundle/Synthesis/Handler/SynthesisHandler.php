<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
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
        return $this->createOrUpdateSynthesis($synthesis);
    }

    public function createOrUpdateElementsFromSource(Synthesis $synthesis)
    {
        if ($synthesis->getSourceType() == "consultation_step") {
            return $this->consultationStepExtractor->createOrUpdateElementsFromConsultationStep($synthesis, $synthesis->getConsultationStep());
        }
        return $synthesis;
    }
}
