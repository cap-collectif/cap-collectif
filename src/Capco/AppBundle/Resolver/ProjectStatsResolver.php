<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepProposalCountResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\UserBundle\Repository\UserTypeRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class ProjectStatsResolver
{
    protected $selectionStepRepo;
    protected $collectStepRepo;
    protected $themeRepo;
    protected $categoryRepo;
    protected $districtRepo;
    protected $userTypeRepo;
    protected $proposalRepo;
    protected $proposalSelectionVoteRepo;
    protected $collectStepProposalCountResolver;
    protected $adapter;

    public function __construct(
        SelectionStepRepository $selectionStepRepo,
        CollectStepRepository $collectStepRepo,
        ThemeRepository $themeRepo,
        ProposalDistrictRepository $districtRepo,
        ProposalCategoryRepository $categoryRepo,
        UserTypeRepository $userTypeRepo,
        ProposalRepository $proposalRepo,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepo,
        CollectStepProposalCountResolver $collectStepProposalCountResolver,
        PromiseAdapterInterface $adapter
    ) {
        $this->selectionStepRepo = $selectionStepRepo;
        $this->collectStepRepo = $collectStepRepo;
        $this->themeRepo = $themeRepo;
        $this->districtRepo = $districtRepo;
        $this->categoryRepo = $categoryRepo;
        $this->userTypeRepo = $userTypeRepo;
        $this->proposalRepo = $proposalRepo;
        $this->proposalSelectionVoteRepo = $proposalSelectionVoteRepo;
        $this->collectStepProposalCountResolver = $collectStepProposalCountResolver;
        $this->adapter = $adapter;
    }

    public function getStepsWithStatsForProject(Project $project)
    {
        $selectionSteps = $this->selectionStepRepo->getVotableStepsForProject($project);
        $collectSteps = $this->collectStepRepo->getCollectStepsForProject($project);
        $steps = array_merge($collectSteps, $selectionSteps);
        usort($steps, function ($a, $b) {
            return $a->getProjectAbstractStep()->getPosition() >
                $b->getProjectAbstractStep()->getPosition()
                ? 1
                : -1;
        });

        $stepsWithData = [];
        foreach ($steps as $step) {
            $s = [];
            $s['id'] = $step->getId();
            $s['title'] = $step->getTitle();
            $s['type'] = $step->getType();
            $s['stats'] = $this->getStatsForStep($step, 10);
            if ($step instanceof SelectionStep) {
                $s['usingThemes'] = $step->getProposalForm()->isUsingThemes();
                $s['usingCategories'] = $step->getProposalForm()->isUsingCategories();
                $s['usingDistricts'] = $step->getProposalForm()->isUsingDistrict();
            }
            $stepsWithData[] = $s;
        }

        return $stepsWithData;
    }

    public function getStatsForStep(AbstractStep $step, $limit = null)
    {
        $stats = [];
        if ('collect' === $step->getType()) {
            $stats['themes'] = $this->getStatsForStepByKey($step, 'themes', $limit);
            $stats['districts'] = $this->getStatsForStepByKey($step, 'districts', $limit);
            $stats['categories'] = $this->getStatsForStepByKey($step, 'categories', $limit);
            $stats['userTypes'] = $this->getStatsForStepByKey($step, 'userTypes', $limit);
            if ($step->getProposalForm()->isCostable()) {
                $stats['costs'] = $this->getStatsForStepByKey($step, 'costs', $limit);
            }
        } elseif ('selection' === $step->getType()) {
            $stats['votes'] = $this->getStatsForStepByKey($step, 'votes', $limit);
        }

        return $stats;
    }

    public function getStatsForStepByKey(
        AbstractStep $step,
        $key,
        $limit = null,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ) {
        $data = [];
        $count = 0;
        if ('collect' === $step->getType()) {
            $promise = $this->collectStepProposalCountResolver
                ->__invoke($step)
                ->then(function ($value) use (&$count) {
                    $count = $value;
                });

            $this->adapter->await($promise);
        }

        switch ($key) {
            case 'themes':
                if ('collect' === $step->getType()) {
                    $data['total'] = $this->countThemes();
                    $data['values'] = $this->getThemesWithProposalsCountForStep(
                        $step,
                        $count,
                        $limit
                    );
                }

                break;
            case 'districts':
                if ('collect' === $step->getType()) {
                    $data['values'] = $this->getDistrictsWithProposalsCountForStep(
                        $step,
                        $count,
                        $limit
                    );
                    $data['total'] = $this->countDistricts();
                }

                break;
            case 'userTypes':
                if ('collect' === $step->getType()) {
                    $data['values'] = $this->getUserTypesWithProposalsCountForStep(
                        $step,
                        $count,
                        $limit
                    );
                    $data['total'] = $this->countUserTypes();
                }

                break;
            case 'costs':
                if ('collect' === $step->getType()) {
                    $data['values'] = $this->getProposalsWithCostsForStep($step, $limit);
                    $promise = $this->collectStepProposalCountResolver
                        ->__invoke($step)
                        ->then(function ($value) use (&$data) {
                            $data['total'] = $value;
                        });

                    $this->adapter->await($promise);
                }

                break;
            case 'votes':
                if ('selection' === $step->getType()) {
                    $data['values'] = $this->getProposalsWithVotesCountForSelectionStep(
                        $step,
                        $limit,
                        $themeId,
                        $districtId,
                        $categoryId
                    );
                    $data['total'] = $this->getProposalsCountForSelectionStep(
                        $step,
                        $themeId,
                        $districtId,
                        $categoryId
                    );
                }

                break;
            case 'categories':
                $data['values'] = $this->getCategoriesWithProposalsCountForStep(
                    $step,
                    $count,
                    $limit
                );
                $data['total'] = $this->categoryRepo->countAll();

                break;
        }

        return $data;
    }

    public function getCategoriesWithProposalsCountForStep(
        CollectStep $step,
        $count = 0,
        $limit = null
    ) {
        $data = $this->categoryRepo->getCategoriesWithProposalsCountForStep($step, $limit);

        return $this->addPercentages($data, $count);
    }

    public function getThemesWithProposalsCountForStep(CollectStep $step, $count = 0, $limit = null)
    {
        $data = $this->themeRepo->getThemesWithProposalsCountForStep($step, $limit);

        return $this->addPercentages($data, $count);
    }

    public function countThemes()
    {
        return $this->themeRepo->countAll();
    }

    public function getDistrictsWithProposalsCountForStep(
        CollectStep $step,
        $count = 0,
        $limit = null
    ) {
        $data = $this->districtRepo->getDistrictsWithProposalsCountForStep($step, $limit);

        return $this->addPercentages($data, $count);
    }

    public function countDistricts()
    {
        return $this->districtRepo->countAll();
    }

    public function getUserTypesWithProposalsCountForStep(
        CollectStep $step,
        $count = 0,
        $limit = null
    ) {
        $data = $this->userTypeRepo->getUserTypesWithProposalsCountForStep($step, $limit);

        return $this->addPercentages($data, $count);
    }

    public function countUserTypes()
    {
        return $this->userTypeRepo->countAll();
    }

    public function getProposalsWithCostsForStep(CollectStep $step, $limit = null)
    {
        $data = $this->proposalRepo->getProposalsWithCostsForStep($step, $limit);

        return $this->addPercentages($data, $this->getTotalCostForStep($step));
    }

    public function getTotalCostForStep(CollectStep $step)
    {
        return $this->proposalRepo->getTotalCostForStep($step);
    }

    public function getProposalsWithVotesCountForSelectionStep(
        SelectionStep $step,
        $limit = null,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ) {
        $data = $this->proposalRepo->getProposalsWithVotesCountForSelectionStep(
            $step,
            $limit,
            $themeId,
            $districtId,
            $categoryId
        );

        return $this->addPercentages(
            $data,
            $this->getVotesCountForSelectionStep($step, $themeId, $districtId, $categoryId)
        );
    }

    public function getVotesCountForSelectionStep(
        SelectionStep $step,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ) {
        return $this->proposalSelectionVoteRepo->getVotesCountForSelectionStep(
            $step,
            $themeId,
            $districtId,
            $categoryId
        );
    }

    public function getProposalsCountForSelectionStep(
        SelectionStep $step,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ) {
        return $this->proposalRepo->countForSelectionStep(
            $step,
            $themeId,
            $districtId,
            $categoryId
        );
    }

    public function addPercentages(array $values, $base)
    {
        $newValues = [];
        foreach ($values as $value) {
            $percentage = 0;
            if ($base && $value['value']) {
                $percentage = round(($value['value'] / $base) * 100, 2);
            }
            $value['percentage'] = $percentage;
            $newValues[] = $value;
        }

        return $newValues;
    }

    public function hasStepsWithStats(Project $project)
    {
        $selectionSteps = $this->selectionStepRepo->getVotableStepsForProject($project);
        $collectSteps = $this->collectStepRepo->getCollectStepsForProject($project);
        $steps = array_merge($collectSteps, $selectionSteps);

        return \count($steps) > 0;
    }
}
