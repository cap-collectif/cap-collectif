<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
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
    private const PROJECT_STEPS_TYPE = 'ProjectStepsType';

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
    private $cache;

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
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        RedisCache $cache
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
        $this->cache = $cache;
    }

    public function __invoke(User $user, Project $project, Argument $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        if (!$project->hasParticipativeStep()) {
            return $paginator->auto($args, 0);
        }

        // Here, we check step's type across all of steps project in order to
        // only trigger repository's methods when it is necessary.
        $projectStepsStatus = $this->initProjectStepsTypeCache($project);

        $totalCount = 0;

        if ($projectStepsStatus['hasConsultationStep']) {
            $totalCount += $this->opinionRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->opinionVersionRepository->countByAuthorAndProject(
                $user,
                $project
            );
            $totalCount += $this->argumentRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->sourceRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->opinionVoteRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->argumentVoteRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->sourceVoteRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->opinionVersionVoteRepository->countByAuthorAndProject(
                $user,
                $project
            );
        }
        if ($projectStepsStatus['hasCollectOrSelectStep']) {
            $totalCount += $this->proposalRepository->countByAuthorAndProject($user, $project);
            $totalCount += $this->proposalCollectVoteRepository->countByAuthorAndProject(
                $user,
                $project
            );
            $totalCount += $this->proposalSelectVoteRepository->countByAuthorAndProject(
                $user,
                $project
            );
        }
        if ($projectStepsStatus['hasQuestionnaireStep']) {
            $totalCount += $this->replyRepository->countByAuthorAndProject($user, $project);
        }

        // Comments are not accounted

        return $paginator->auto($args, $totalCount);
    }

    private function initProjectStepsTypeCache(Project $project): array
    {
        $projectStepsTypeCachedItem = $this->cache->getItem(
            self::PROJECT_STEPS_TYPE . ' - ' . $project->getId()
        );

        if (!$projectStepsTypeCachedItem->isHit()) {
            $steps = $project->getRealSteps();
            $item = [
                'hasConsultationStep' => false,
                'hasQuestionnaireStep' => false,
                'hasCollectOrSelectStep' => false,
            ];
            foreach ($steps as $step) {
                /** @var AbstractStep $step */
                if ($step->isConsultationStep()) {
                    $item['hasConsultationStep'] = true;
                }
                if ($step->isQuestionnaireStep()) {
                    $item['hasQuestionnaireStep'] = true;
                }
                if ($step->isCollectStep() || $step->isSelectionStep()) {
                    $item['hasCollectOrSelectStep'] = true;
                }
            }
            $projectStepsTypeCachedItem->set($item)->expiresAfter(RedisCache::ONE_MINUTE);
        }

        return $projectStepsTypeCachedItem->get();
    }
}
