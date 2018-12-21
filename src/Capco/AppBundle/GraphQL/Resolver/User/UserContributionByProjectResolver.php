<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;

class UserContributionByProjectResolver implements ResolverInterface
{
    private $opinionRepository;
    private $argumentRepository;
    private $opinionVersionRepository;
    private $sourceRepository;
    private $proposalRepository;
    private $replyRepository;
    private $opinionVoteRepository;
    private $argumentVoteRepository;
    private $sourceVoteRepository;
    private $opinionVersionVoteRepository;
    private $proposalCollectVoteRepository;
    private $proposalSelectVoteRepository;

    public function __construct(
        OpinionRepository $opinionRepository,
        ArgumentRepository $argumentRepository,
        OpinionVersionRepository $opinionVersionRepository,
        SourceRepository $sourceRepository,
        ProposalRepository $proposalRepository,
        ReplyRepository $replyRepository,
        OpinionVoteRepository $opinionVoteRepository,
        ArgumentVoteRepository $argumentVoteRepository,
        SourceVoteRepository $sourceVoteRepository,
        OpinionVersionVoteRepository $opinionVersionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    ) {
        $this->opinionRepository = $opinionRepository;
        $this->argumentRepository = $argumentRepository;
        $this->sourceRepository = $sourceRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->proposalRepository = $proposalRepository;
        $this->replyRepository = $replyRepository;
        $this->opinionVersionVoteRepository = $opinionVersionVoteRepository;
        $this->opinionVoteRepository = $opinionVoteRepository;
        $this->argumentVoteRepository = $argumentVoteRepository;
        $this->sourceVoteRepository = $sourceVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectVoteRepository = $proposalSelectionVoteRepository;
    }

    public function __invoke(User $user, Project $project, Argument $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        if (!$project->hasParticipativeStep()) {
            return $paginator->auto($args, 0);
        }

        $totalCount = 0;

        // Contributions
        $totalCount += $this->opinionRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->opinionVersionRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->argumentRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->sourceRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->proposalRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->replyRepository->countByAuthorAndProject($user, $project);

        // Votes
        $totalCount += $this->opinionVoteRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->argumentVoteRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->sourceVoteRepository->countByAuthorAndProject($user, $project);
        $totalCount += $this->opinionVersionVoteRepository->countByAuthorAndProject(
            $user,
            $project
        );
        $totalCount += $this->proposalCollectVoteRepository->countByAuthorAndProject(
            $user,
            $project
        );
        $totalCount += $this->proposalSelectVoteRepository->countByAuthorAndProject(
            $user,
            $project
        );

        // Comments are not accounted

        return $paginator->auto($args, $totalCount);
    }
}
