<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Consultation;
use Capco\UserBundle\Repository\UserRepository;

class ContributionResolver
{
    protected $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    // Code may looks ugly but in fact it's highly optimized !
    public function getConsultationContributorsOrdered(Consultation $consultation, $pagination = 0, $page = 1)
    {
        // Fetch contributors
        $sourcesContributors = $this->repository->findConsultationSourceContributorsWithCount($consultation);
        $argumentsContributors = $this->repository->findConsultationArgumentContributorsWithCount($consultation);
        $opinionsContributors = $this->repository->findConsultationOpinionContributorsWithCount($consultation);
        $versionsContributors = $this->repository->findConsultationVersionContributorsWithCount($consultation);

        // Fetch voters
        $opinionsVoters = $this->repository->findConsultationOpinionVotersWithCount($consultation);
        $versionsVoters = $this->repository->findConsultationVersionVotersWithCount($consultation);
        $argumentsVoters = $this->repository->findConsultationArgumentVotersWithCount($consultation);
        $sourcesVoters = $this->repository->findConsultationSourceVotersWithCount($consultation);

        $contributors = [];

        foreach ($sourcesContributors as $sourcesContributor) {
            $contributors[$sourcesContributor['id']]['sources'] = $sourcesContributor['sources_count'];
        }

        foreach ($argumentsContributors as $argumentsContributor) {
            $contributors[$argumentsContributor['id']]['arguments'] = $argumentsContributor['arguments_count'];
        }

        foreach ($opinionsContributors as $opinionsContributor) {
            $contributors[$opinionsContributor['id']]['opinions'] = $opinionsContributor['opinions_count'];
        }

        foreach ($versionsContributors as $versionContributor) {
            $contributors[$versionContributor['id']]['versions'] = $versionContributor['versions_count'];
        }

        foreach ($opinionsVoters as $opinionsVoter) {
            $contributors[$opinionsVoter['id']]['opinions_votes'] = $opinionsVoter['opinions_votes_count'];
        }

        foreach ($versionsVoters as $versionVoter) {
            $contributors[$versionVoter['id']]['versions_votes'] = $versionVoter['versions_votes_count'];
        }

        foreach ($argumentsVoters as $argumentsVoter) {
            $contributors[$argumentsVoter['id']]['arguments_votes'] = $argumentsVoter['arguments_votes_count'];
        }

        foreach ($sourcesVoters as $sourcesVoter) {
            $contributors[$sourcesVoter['id']]['sources_votes'] = $sourcesVoter['sources_votes_count'];
        }

        foreach ($contributors as &$contributor) {
            $contributor['total'] = isset($contributor['sources']) ? $contributor['sources'] : 0;
            $contributor['total'] += isset($contributor['arguments']) ? $contributor['arguments'] : 0;
            $contributor['total'] += isset($contributor['opinions']) ? $contributor['opinions'] : 0;
            $contributor['total'] += isset($contributor['versions']) ? $contributor['versions'] : 0;
            $contributor['total'] += isset($contributor['opinions_votes']) ? $contributor['opinions_votes'] : 0;
            $contributor['total'] += isset($contributor['versions_votes']) ? $contributor['versions_votes'] : 0;
            $contributor['total'] += isset($contributor['arguments_votes']) ? $contributor['arguments_votes'] : 0;
            $contributor['total'] += isset($contributor['sources_votes']) ? $contributor['sources_votes'] : 0;
        }

        uasort($contributors, function ($a, $b) { return $b['total'] - $a['total']; });

        if ($pagination && $page) {
            $contributorsPage = array_slice($contributors, $pagination*$page - $pagination, $pagination, true);

            $users = $this->repository->findWithMediaByIds(array_keys($contributorsPage));

            foreach ($users as $user) {
                $contributors[$user->getId()]['user'] = $user;
            }
        }

        return $contributors;
    }

    public function countConsultationContributors(Consultation $consultation)
    {
        return count($this->getConsultationContributorsOrdered($consultation));
    }

    public function countConsultationContributions(Consultation $consultation)
    {
        $count = 0;
        foreach ($consultation->getSteps() as $step) {
            if ($step->getStep()->isConsultationStep()) {
                $count += $step->getStep()->getContributionsCount();
            }
        }

        return $count;
    }

    public function countConsultationVotes(Consultation $consultation)
    {
        $count = 0;
        foreach ($consultation->getSteps() as $step) {
            if ($step->getStep()->isConsultationStep()) {
                foreach ($step->getStep()->getOpinions() as $opinion) {
                    $count += $opinion->getVoteCountAll();
                    foreach ($opinion->getArguments() as $argument) {
                        $count += $argument->getVoteCount();
                    }
                    foreach ($opinion->getSources() as $source) {
                        $count += $source->getVoteCount();
                    }
                    foreach ($opinion->getVersions() as $version) {
                        $count += $version->getVoteCountAll();
                        foreach ($version->getArguments() as $argument) {
                            $count += $argument->getVoteCount();
                        }
                        foreach ($version->getSources() as $source) {
                            $count += $source->getVoteCount();
                        }
                    }
                }
            }
        }

        return $count;
    }
}
