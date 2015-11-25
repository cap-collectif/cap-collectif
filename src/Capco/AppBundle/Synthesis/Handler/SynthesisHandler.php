<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor;
use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SynthesisHandler
{
    protected $em;
    protected $consultationStepExtractor;

    public function __construct(EntityManager $em, ConsultationStepExtractor $consultationStepExtractor)
    {
        $this->em = $em;
        $this->consultationStepExtractor = $consultationStepExtractor;
    }

    public function getAllSyntheses()
    {
        return $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->findAll();
    }

    public function createSynthesis(Synthesis $synthesis)
    {
        $this->em->persist($synthesis);
        $this->em->flush();

        $synthesis = $this->createOrUpdateElementsFromSource($synthesis);

        return $synthesis;
    }

    public function updateSynthesis(Synthesis $synthesis)
    {
        $this->em->persist($synthesis);
        $this->em->flush();

        return $synthesis;
    }

    public function getSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->getOne($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $synthesis;
    }

    public function getUpdatedSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        $synthesis = $this->createOrUpdateElementsFromSource($synthesis);

        return $synthesis;
    }

    public function createSynthesisFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        $synthesis->setConsultationStep($consultationStep);
        $synthesis->setSourceType('consultation_step');

        return $this->createSynthesis($synthesis);
    }

    public function createOrUpdateElementsFromSource(Synthesis $synthesis)
    {
        if ($synthesis->getSourceType() === 'consultation_step') {
            return $this->consultationStepExtractor->createOrUpdateElementsFromConsultationStep($synthesis, $synthesis->getConsultationStep());
        }

        return $synthesis;
    }
}
