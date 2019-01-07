<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepContributionsResolver;

class ContributionResolver
{
    protected $repository;
    protected $stepContributionsResolver;

    public function __construct(
        UserRepository $repository,
        StepContributionsResolver $stepContributionsResolver
    ) {
        $this->repository = $repository;
        $this->stepContributionsResolver = $stepContributionsResolver;
    }

    // Code may looks ugly but in fact it's highly optimized !
    // Nope TODO https://github.com/cap-collectif/platform/issues/5296
    public function getProjectContributorsOrdered(
        Project $project,
        $excludePrivate = false,
        $pagination = 16,
        $page = 1
    ): array {
        // Fetch contributors
        $sourcesContributors = $this->repository->findProjectSourceContributorsWithCount($project);
        $argumentsContributors = $this->repository->findProjectArgumentContributorsWithCount(
            $project
        );
        $opinionsContributors = $this->repository->findProjectOpinionContributorsWithCount(
            $project
        );
        $versionsContributors = $this->repository->findProjectVersionContributorsWithCount(
            $project
        );

        $proposalsContributors = $this->repository->findProjectProposalContributorsWithCount(
            $project
        );
        $repliesContributors = $this->repository->findProjectReplyContributorsWithCount(
            $project,
            $excludePrivate
        );

        // Fetch voters
        $opinionsVoters = $this->repository->findProjectOpinionVotersWithCount($project);
        $versionsVoters = $this->repository->findProjectVersionVotersWithCount($project);
        $argumentsVoters = $this->repository->findProjectArgumentVotersWithCount($project);
        $sourcesVoters = $this->repository->findProjectSourceVotersWithCount($project);
        $proposalsVoters = $this->repository->findProjectProposalVotersWithCount(
            $project,
            $excludePrivate
        );

        $contributors = [];

        foreach ($sourcesContributors as $sourcesContributor) {
            $contributors[$sourcesContributor['id']]['sources'] =
                $sourcesContributor['sources_count'];
        }

        foreach ($argumentsContributors as $argumentsContributor) {
            $contributors[$argumentsContributor['id']]['arguments'] =
                $argumentsContributor['arguments_count'];
        }

        foreach ($opinionsContributors as $opinionsContributor) {
            $contributors[$opinionsContributor['id']]['opinions'] =
                $opinionsContributor['opinions_count'];
        }

        foreach ($proposalsContributors as $proposalsContributor) {
            $contributors[$proposalsContributor['id']]['proposals'] =
                $proposalsContributor['proposals_count'];
        }

        foreach ($repliesContributors as $repliesContributor) {
            $contributors[$repliesContributor['id']]['replies'] =
                $repliesContributor['replies_count'];
        }

        foreach ($versionsContributors as $versionContributor) {
            $contributors[$versionContributor['id']]['versions'] =
                $versionContributor['versions_count'];
        }

        foreach ($opinionsVoters as $opinionsVoter) {
            $contributors[$opinionsVoter['id']]['opinions_votes'] =
                $opinionsVoter['opinions_votes_count'];
        }

        foreach ($versionsVoters as $versionVoter) {
            $contributors[$versionVoter['id']]['versions_votes'] =
                $versionVoter['versions_votes_count'];
        }

        foreach ($argumentsVoters as $argumentsVoter) {
            $contributors[$argumentsVoter['id']]['arguments_votes'] =
                $argumentsVoter['arguments_votes_count'];
        }

        foreach ($sourcesVoters as $sourcesVoter) {
            $contributors[$sourcesVoter['id']]['sources_votes'] =
                $sourcesVoter['sources_votes_count'];
        }

        foreach ($proposalsVoters as $proposalsVoter) {
            $contributors[$proposalsVoter['id']]['proposals_votes'] =
                $proposalsVoter['proposals_votes_count'];
        }

        foreach ($contributors as &$contributor) {
            $contributor['contributions'] = $contributor['sources'] ?? 0;
            $contributor['contributions'] += $contributor['arguments'] ?? 0;
            $contributor['contributions'] += $contributor['opinions'] ?? 0;
            $contributor['contributions'] += $contributor['proposals'] ?? 0;
            $contributor['contributions'] += $contributor['replies'] ?? 0;
            $contributor['contributions'] += $contributor['versions'] ?? 0;
            $contributor['votes'] = $contributor['opinions_votes'] ?? 0;
            $contributor['votes'] += $contributor['versions_votes'] ?? 0;
            $contributor['votes'] += $contributor['arguments_votes'] ?? 0;
            $contributor['votes'] += $contributor['sources_votes'] ?? 0;
            $contributor['votes'] += $contributor['proposals_votes'] ?? 0;
        }

        uasort($contributors, function ($a, $b) {
            return $b['contributions'] + $b['votes'] - $a['contributions'] - $a['votes'];
        });

        if ($pagination && $page) {
            $contributorsPage = \array_slice(
                $contributors,
                $pagination * $page - $pagination,
                $pagination,
                true
            );

            $users = $this->repository->findWithMediaByIds(array_keys($contributorsPage));

            foreach ($users as $user) {
                $contributors[$user->getId()]['user'] = $user;
            }
        }

        return $contributors;
    }

    public function countProjectContributors(Project $project): int
    {
        return \count($this->getProjectContributorsOrdered($project));
    }

    // Code may looks ugly but in fact it's highly optimized !
    public function getStepContributorsOrdered(AbstractStep $step): array
    {
        $contributors = [];

        if ($step instanceof ConsultationStep) {
            // Fetch contributors
            $sourcesContributors = $this->repository->findConsultationStepSourceContributorsWithCount(
                $step
            );
            $argumentsContributors = $this->repository->findConsultationStepArgumentContributorsWithCount(
                $step
            );
            $opinionsContributors = $this->repository->findConsultationStepOpinionContributorsWithCount(
                $step
            );
            $versionsContributors = $this->repository->findConsultationStepVersionContributorsWithCount(
                $step
            );
            // Fetch voters
            $opinionsVoters = $this->repository->findConsultationStepOpinionVotersWithCount($step);
            $versionsVoters = $this->repository->findConsultationStepVersionVotersWithCount($step);
            $argumentsVoters = $this->repository->findConsultationStepArgumentVotersWithCount(
                $step
            );
            $sourcesVoters = $this->repository->findConsultationStepSourceVotersWithCount($step);
            // Fill array
            foreach ($sourcesContributors as $sourcesContributor) {
                $contributors[$sourcesContributor['id']]['sources'] =
                    $sourcesContributor['sources_count'];
            }
            foreach ($argumentsContributors as $argumentsContributor) {
                $contributors[$argumentsContributor['id']]['arguments'] =
                    $argumentsContributor['arguments_count'];
            }
            foreach ($opinionsContributors as $opinionsContributor) {
                $contributors[$opinionsContributor['id']]['opinions'] =
                    $opinionsContributor['opinions_count'];
            }
            foreach ($versionsContributors as $versionContributor) {
                $contributors[$versionContributor['id']]['versions'] =
                    $versionContributor['versions_count'];
            }
            foreach ($opinionsVoters as $opinionsVoter) {
                $contributors[$opinionsVoter['id']]['opinions_votes'] =
                    $opinionsVoter['opinions_votes_count'];
            }
            foreach ($versionsVoters as $versionVoter) {
                $contributors[$versionVoter['id']]['versions_votes'] =
                    $versionVoter['versions_votes_count'];
            }
            foreach ($argumentsVoters as $argumentsVoter) {
                $contributors[$argumentsVoter['id']]['arguments_votes'] =
                    $argumentsVoter['arguments_votes_count'];
            }
            foreach ($sourcesVoters as $sourcesVoter) {
                $contributors[$sourcesVoter['id']]['sources_votes'] =
                    $sourcesVoter['sources_votes_count'];
            }
        } elseif ($step instanceof CollectStep) {
            $proposalsContributors = $this->repository->findCollectStepProposalContributorsWithCount(
                $step
            );
            foreach ($proposalsContributors as $proposalsContributor) {
                $contributors[$proposalsContributor['id']]['proposals'] =
                    $proposalsContributor['proposals_count'];
            }
        } elseif ($step instanceof QuestionnaireStep) {
            $repliesContributors = $this->repository->findQuestionnaireStepReplyContributorsWithCount(
                $step
            );
            foreach ($repliesContributors as $repliesContributor) {
                $contributors[$repliesContributor['id']]['replies'] =
                    $repliesContributor['replies_count'];
            }
        } elseif ($step instanceof SelectionStep) {
            $proposalsVoters = $this->repository->findSelectionStepProposalVotersWithCount($step);
            foreach ($proposalsVoters as $proposalsVoter) {
                $contributors[$proposalsVoter['id']]['proposals_votes'] =
                    $proposalsVoter['proposals_votes_count'];
            }
        }

        foreach ($contributors as &$contributor) {
            $contributor['contributions'] = $contributor['sources'] ?? 0;
            $contributor['contributions'] += $contributor['arguments'] ?? 0;
            $contributor['contributions'] += $contributor['opinions'] ?? 0;
            $contributor['contributions'] += $contributor['proposals'] ?? 0;
            $contributor['contributions'] += $contributor['versions'] ?? 0;
            $contributor['votes'] = $contributor['opinions_votes'] ?? 0;
            $contributor['votes'] += $contributor['versions_votes'] ?? 0;
            $contributor['votes'] += $contributor['arguments_votes'] ?? 0;
            $contributor['votes'] += $contributor['sources_votes'] ?? 0;
            $contributor['votes'] += $contributor['proposals_votes'] ?? 0;
        }

        uasort($contributors, function ($a, $b) {
            return $b['contributions'] + $b['votes'] - $a['contributions'] - $a['votes'];
        });

        return $contributors;
    }

    public function countStepContributors(AbstractStep $step): int
    {
        return \count($this->getStepContributorsOrdered($step));
    }

    public function countProjectContributions(Project $project): int
    {
        $count = 0;
        foreach ($project->getSteps() as $step) {
            $count += $this->stepContributionsResolver->__invoke(
                $step->getStep(),
                new Argument(['first' => 0])
            )->totalCount;
        }

        // Also count project comments ?
        return $count;
    }
}
