<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\ORM\EntityManager;

class ProjectStatsResolver
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function getStepsWithStatsForProject(Project $project)
    {
        $selectionSteps = $this->em
            ->getRepository('CapcoAppBundle:Steps\SelectionStep')
            ->getVotableStepsForProject($project)
        ;
        $collectSteps = $this->em
            ->getRepository('CapcoAppBundle:Steps\CollectStep')
            ->getCollectStepsForProject($project)
        ;
        $steps = array_merge($collectSteps, $selectionSteps);
        usort($steps, function ($a, $b) {
            return $a->getProjectAbstractStep()->getPosition() > $b->getProjectAbstractStep()->getPosition() ? 1 : -1;
        });

        $stepsWithData = [];
        foreach ($steps as $step) {
            $s = [];
            $s['id'] = $step->getId();
            $s['title'] = $step->getTitle();
            $s['type'] = $step->getType();
            $s['stats'] = $this->getStatsForStep($step, 10);
            $stepsWithData[] = $s;
        }

        return $stepsWithData;
    }

    protected function getStatsForStep(AbstractStep $step, $limit = null)
    {
        $stats = [];
        if ($step->getType() === 'collect') {
            $stats['themes'] = $this->getStatsForStepByKey($step, 'themes', $limit);
            $stats['districts'] = $this->getStatsForStepByKey($step, 'districts', $limit);
            $stats['userTypes'] = $this->getStatsForStepByKey($step, 'userTypes', $limit);
            $stats['costs'] = $this->getStatsForStepByKey($step, 'costs', $limit);
        } elseif ($step->getType() === 'selection') {
            $stats['votes'] = $this->getStatsForStepByKey($step, 'votes', $limit);
        }

        return $stats;
    }

    public function getStatsForStepByKey(AbstractStep $step, $key, $limit = null, $themeId = null, $districtId = null)
    {
        $data = [];

        switch ($key) {
            case 'themes':
                if ($step->getType() === 'collect') {
                    $data['total'] = $this->countThemes();
                    $data['values'] = $this->getThemesWithProposalsCountForStep($step, $limit);
                }
                break;
            case 'districts':
                if ($step->getType() === 'collect') {
                    $data['values'] = $this->getDistrictsWithProposalsCountForStep($step, $limit);
                    $data['total'] = $this->countDistricts();
                }
                break;
            case 'userTypes':
                if ($step->getType() === 'collect') {
                    $data['values'] = $this->getUserTypesWithProposalsCountForStep($step, $limit);
                    $data['total'] = $this->countUserTypes();
                }
                break;
            case 'costs':
                if ($step->getType() === 'collect') {
                    $data['values'] = $this->getProposalsWithCostForStep($step, $limit);
                    $data['total'] = $step->getProposalsCount();
                }
                break;
            case 'votes':
                if ($step->getType() === 'selection') {
                    $data['values'] = $this->getProposalsWithVotesCountForSelectionStep($step, $limit, $themeId, $districtId);
                    $data['total'] = $this->getProposalsCountForSelectionStep($step, $themeId, $districtId);
                }
                break;
        }

        return $data;
    }

    protected function getThemesWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $data = $this->em
            ->getRepository('CapcoAppBundle:Theme')
            ->getThemesWithProposalsCountForStep($step, $limit)
        ;
        return $this->addPercentages($data, $step->getProposalsCount());
    }

    protected function countThemes()
    {
        return $this->em
            ->getRepository('CapcoAppBundle:Theme')
            ->countAll()
        ;
    }

    protected function getDistrictsWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $data = $this->em
            ->getRepository('CapcoAppBundle:District')
            ->getDistrictsWithProposalsCountForStep($step, $limit)
        ;
        return $this->addPercentages($data, $step->getProposalsCount());
    }

    protected function countDistricts()
    {
        return $this->em
            ->getRepository('CapcoAppBundle:District')
            ->countAll()
            ;
    }

    protected function getUserTypesWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $data =  $this->em
            ->getRepository('CapcoUserBundle:UserType')
            ->getUserTypesWithProposalsCountForStep($step, $limit)
        ;
        return $this->addPercentages($data, $step->getProposalsCount());
    }

    protected function countUserTypes()
    {
        return $this->em
            ->getRepository('CapcoUserBundle:UserType')
            ->countAll()
            ;
    }

    protected function getProposalsWithCostForStep(CollectStep $step, $limit = null)
    {
        $data = $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getProposalsWithCostsForStep($step, $limit)
        ;
        return $this->addPercentages($data, $this->getTotalCostForStep($step));
    }

    protected function getTotalCostForStep(CollectStep $step)
    {
        return $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getTotalCostForStep($step)
        ;
    }

    protected function getProposalsWithVotesCountForSelectionStep(SelectionStep $step, $limit = null, $themeId = null, $districtId = null)
    {
        $data = $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getProposalsWithVotesCountForSelectionStep($step, $limit, $themeId, $districtId)
        ;
        return $this->addPercentages($data, $this->getVotesCountForSelectionStep($step, $themeId, $districtId));
    }

    protected function getVotesCountForSelectionStep(SelectionStep $step, $themeId = null, $districtId = null)
    {
        return $this->em
            ->getRepository('CapcoAppBundle:ProposalVote')
            ->getVotesCountForSelectionStep($step, $themeId, $districtId)
        ;
    }

    protected function getProposalsCountForSelectionStep(SelectionStep $step, $themeId = null, $districtId = null)
    {
        return $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->countForSelectionStep($step, $themeId, $districtId)
        ;
    }

    protected function addPercentages(array $values, $base)
    {
        $newValues = [];
        foreach ($values as $value) {
            $percentage = 0;
            if ($base && $value['value']) {
                $percentage = round($value['value'] / $base * 100, 2);
            }
            $value['percentage'] = $percentage;
            $newValues[] = $value;
        }
        return $newValues;
    }

    public function hasStepsWithStats(Project $project)
    {
        return count($this->getStepsWithStatsForProject($project)) > 0;
    }
}
