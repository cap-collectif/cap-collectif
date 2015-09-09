<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\ConsultationType;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Routing\Router;

class OpinionTypesResolver
{
    private $opinionTypeRepo;
    private $opinionRepo;

    public function __construct(OpinionTypeRepository $opinionTypeRepo, OpinionRepository $opinionRepo)
    {
        $this->opinionTypeRepo = $opinionTypeRepo;
        $this->opinionRepo = $opinionRepo;
        $this->opinionTypeRepo->setChildrenIndex('children');
    }

    public function getHierarchyForConsultationType(ConsultationType $ct)
    {
        if ($ct === null) {
            return [];
        }

        $opinionTypes = [];
        foreach ($ct->getOpinionTypes() as $root) {
            $opinionTypes = array_merge(
                $opinionTypes,
                $this->opinionTypeRepo->childrenHierarchy($root, false, [], true)
            );
        }
        return $opinionTypes;
    }

    public function getGroupedOpinionsForStep(ConsultationStep $step)
    {
        $tree = $this->getHierarchyForConsultationType($step->getConsultationType());

        $build = function ($tree) use (&$build, &$step) {
            $childrenTree = [];
            foreach ($tree as $node) {
                $node['opinions'] = $this->opinionRepo
                    ->getByConsultationStepAndOpinionTypeOrdered($step, $node['id'], 5, $node['defaultFilter'])
                ;
                $node['total_opinions_count'] = count($node['opinions']);
                if (count($node['children']) > 0) {
                    $node['children'] = $build($node['children']);
                }
                $childrenTree[] = $node;
            }

            return $childrenTree;
        };

        return $build($tree);

    }

    public function getAllForConsultationType(ConsultationType $ct)
    {
        if ($ct === null) {
            return [];
        }

        $opinionTypes = [];
        foreach ($ct->getOpinionTypes() as $root) {
            $opinionTypes = array_merge(
                $opinionTypes,
                $this->opinionTypeRepo->getChildren($root, false, 'position', 'asc', true)
            );
        }
        return $opinionTypes;
    }

    public function consultationTypeAllowType(ConsultationType $consultationType, OpinionType $opinionType)
    {
        if ($consultationType === null) {
            return [];
        }

        $allowed = false;
        $opinionTypes = $this->getAllForConsultationType($consultationType);
        foreach ($opinionTypes as $ot) {
            if ($ot->getId() === $opinionType->getId()) {
                $allowed = true;
                break;
            }
        }
        return $allowed;
    }

    public function stepAllowType(ConsultationStep $step, OpinionType $type)
    {
        if (!$step->getConsultationType()) {
            return false;
        }
        return $this->consultationTypeAllowType($step->getConsultationType(), $type);

    }

    public function getMaximumPositionByOpinionTypeAndStep(OpinionType $opinionType, ConsultationStep $step)
    {
        $opinions = $this->opinionRepo
            ->getByConsultationStepAndOpinionTypeOrdered($step, $opinionType, 5, 'positions')
        ;

        $lastOpinion = $opinions[count($opinions) - 1];
        return $lastOpinion->getPosition();

    }
}
