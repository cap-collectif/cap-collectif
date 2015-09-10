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

    public function getNavForStep(ConsultationStep $step)
    {
        $ct = $step->getConsultationType();

        if ($ct === null) {
            return [];
        }

        $options = [
            'decorate' => true,
            'rootOpen' => '<ul class="nav">',
            'rootClose' => '</ul>',
            'nodeDecorator' => function ($node) {
                $anchor = '#opinion-type--'. $node['slug'];
                $levelClass = 'nav--level-'.$node['level'];
                return
                    '<a class='.$levelClass.' href="'.$anchor.'">'
                    .'<i class="fa fa-plus-circle"></i>'
                    .$node['title']
                    .'</a>'
                    ;
            },
            'childSort' => ['field' => 'position', 'dir' => 'asc'],
        ];

        $nav = '<ul class="nav">';
        foreach ($ct->getOpinionTypes() as $root) {
            $nav .= $this->opinionTypeRepo->childrenHierarchy($root, false, $options, true);
        }
        $nav .= '</ul>';

        return $nav;
    }

    public function getHierarchyForConsultationType(ConsultationType $ct, $options = [])
    {
        if ($ct === null) {
            return [];
        }

        $opinionTypes = [];
        foreach ($ct->getOpinionTypes() as $root) {
            $opinionTypes = array_merge(
                $opinionTypes,
                $this->opinionTypeRepo->childrenHierarchy($root, false, $options, true)
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
