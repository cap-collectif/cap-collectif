<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\ConsultationType;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Symfony\Component\Routing\Router;

class OpinionTypesResolver
{
    private $opinionTypeRepo;
    private $opinionRepo;
    private $router;

    public function __construct(OpinionTypeRepository $opinionTypeRepo, OpinionRepository $opinionRepo, Router $router)
    {
        $this->opinionTypeRepo = $opinionTypeRepo;
        $this->opinionRepo = $opinionRepo;
        $this->router = $router;
        $this->opinionTypeRepo->setChildrenIndex('children');
    }

    public function getNavForStep(ConsultationStep $step)
    {
        $ct = $step->getConsultationType();

        if ($ct === null) {
            return [];
        }

        $url = $this->router->generate('app_consultation_show', ['consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()]);

        $options = [
            'decorate' => true,
            'rootOpen' => '<ul class="nav">',
            'rootClose' => '</ul>',
            'nodeDecorator' => function ($node) use ($url) {
                $link = $url.'#opinion-type--'.$node['slug'];
                $levelClass = 'nav--level-'.$node['level'];

                return
                    '<a class='.$levelClass.' href="'.$link.'">'
                    .'<i class="fa fa-plus-circle"></i>'
                    .$node['title']
                    .'</a>'
                    ;
            },
            'childSort' => ['field' => 'position', 'dir' => 'asc'],
        ];

        $nav = '';

        foreach ($ct->getOpinionTypes() as $root) {
            $nav .= $this->opinionTypeRepo->childrenHierarchy($root, false, $options, true);
        }

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

    public function getGroupedOpinionsForStep(ConsultationStep $step, $limit = 5, $page = 1)
    {
        $tree = $this->getHierarchyForConsultationType($step->getConsultationType());

        $build = function ($tree) use (&$build, &$step, &$limit, &$page) {
            $childrenTree = [];
            foreach ($tree as $node) {
                $node['opinions'] = $this->opinionRepo
                    ->getByOpinionTypeAndConsultationStepOrdered($step, $node['id'], $limit, $page, $node['defaultFilter'])
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

    public function getMaximumPositionByOpinionTypeAndStep($opinionType, ConsultationStep $step)
    {
        return $this->opinionRepo
            ->getMaxPositionByOpinionTypeAndConsultationStep($step, $opinionType)
        ;
    }
}
