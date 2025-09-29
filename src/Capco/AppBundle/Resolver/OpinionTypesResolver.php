<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\RouterInterface;

class OpinionTypesResolver
{
    public function __construct(
        private readonly OpinionTypeRepository $opinionTypeRepo,
        private readonly OpinionRepository $opinionRepo,
        private readonly RouterInterface $router
    ) {
    }

    public function findByStepAndSlug(ConsultationStep $step, string $slug): OpinionType
    {
        foreach ($step->getConsultations() as $consultation) {
            foreach ($consultation->getOpinionTypes() as $section) {
                if ($section->getSlug() === $slug) {
                    return $section;
                }
            }
        }

        throw new NotFoundHttpException('This type does not exist for this consultation step');
    }

    public function getAvailableLinkTypesForConsultation(Consultation $consultation)
    {
        return $this->opinionTypeRepo->getLinkableOpinionTypesForConsultation($consultation);
    }
}
