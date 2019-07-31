<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\RouterInterface;

class OpinionTypesResolver
{
    private $opinionTypeRepo;
    private $opinionRepo;
    private $router;

    public function __construct(
        OpinionTypeRepository $opinionTypeRepo,
        OpinionRepository $opinionRepo,
        RouterInterface $router
    ) {
        $this->opinionTypeRepo = $opinionTypeRepo;
        $this->opinionRepo = $opinionRepo;
        $this->router = $router;
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
