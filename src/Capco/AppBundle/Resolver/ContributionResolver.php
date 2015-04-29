<?php

namespace Capco\AppBundle\Resolver;

use Capco\UserBundle\Repository\UserRepository;

class ContributionResolver
{
    protected $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    // Code may looks ugly but in fact it's highly optimized !
    public function getConsultationContributorsOrdered($consultation)
    {
        // Fetch contributors
        $sourcesContributors = $this->repository->findConsultationSourceContributorsWithCount($consultation);
        $argumentsContributors = $this->repository->findConsultationArgumentContributorsWithCount($consultation);
        $opinionsContributors = $this->repository->findConsultationOpinionContributorsWithCount($consultation);

        // Fetch voters
        $opinionsVoters = $this->repository->findConsultationOpinionVotersWithCount($consultation);
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

        foreach ($opinionsVoters as $opinionsVoter) {
            $contributors[$opinionsVoter['id']]['opinions_votes'] = $opinionsVoter['opinions_votes_count'];
        }

        foreach ($argumentsVoters as $argumentsVoter) {
            $contributors[$argumentsVoter['id']]['arguments_votes'] = $argumentsVoter['arguments_votes_count'];
        }

        foreach ($sourcesVoters as $sourcesVoter) {
            $contributors[$sourcesVoter['id']]['sources_votes'] = $sourcesVoter['sources_votes_count'];
        }

        $users = $this->repository->findWithMediaByIds(array_keys($contributors));

        foreach ($users as $user) {
            $contributors[$user->getId()]['user'] = $user;
        }

        foreach ($contributors as &$contributor) {
            $contributor['total']  = isset($contributor['sources']) ? $contributor['sources'] : 0;
            $contributor['total'] += isset($contributor['arguments']) ? $contributor['arguments'] : 0;
            $contributor['total'] += isset($contributor['opinions']) ? $contributor['opinions'] : 0;
            $contributor['total'] += isset($contributor['opinions_votes']) ? $contributor['opinions_votes'] : 0;
            $contributor['total'] += isset($contributor['arguments_votes']) ? $contributor['arguments_votes'] : 0;
            $contributor['total'] += isset($contributor['sources_votes']) ? $contributor['sources_votes'] : 0;
        }

        usort($contributors, function ($a, $b) { return $b['total'] - $a['total']; });

        return $contributors;
    }

    public function countConsultationContributors($consultation)
    {
        return count($this->getConsultationContributorsOrdered($consultation));
    }
}
