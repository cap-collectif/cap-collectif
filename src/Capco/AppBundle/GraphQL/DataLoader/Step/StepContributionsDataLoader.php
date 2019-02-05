<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step;

use Psr\Log\LoggerInterface;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;

class StepContributionsDataLoader extends BatchDataLoader
{
    protected $opinionRepository;
    protected $sourceRepository;
    protected $argumentRepository;
    protected $opinionVersionRepository;
    protected $proposalRepository;
    protected $proposalCollectVoteRepository;
    protected $replyRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        OpinionRepository $opinionRepository,
        SourceRepository $sourceRepository,
        ArgumentRepository $argumentRepository,
        OpinionVersionRepository $opinionVersionRepository,
        ProposalRepository $proposalRepository,
        ReplyRepository $replyRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->opinionRepository = $opinionRepository;
        $this->sourceRepository = $sourceRepository;
        $this->argumentRepository = $argumentRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->proposalRepository = $proposalRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->replyRepository = $replyRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $enableCache
        );
    }

    public function invalidate(AbstractStep $step): void
    {
        $this->invalidateAll();
    }

    public function all(array $keys): Promise
    {
        $results = [];

        foreach ($keys as $key) {
            $results[] = $this->resolveWithoutBatch($key['step'], $key['args']);
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function serializeKey($key)
    {
        return [
            'stepId' => $key['step']->getId(),
            'args' => $key['args'],
        ];
    }

    private function resolveWithoutBatch(AbstractStep $step, Argument $args): Connection
    {
        $totalCount = 0;
        if ($step instanceof ConsultationStep) {
            $totalCount += $this->opinionRepository->countPublishedContributionsByStep($step);
            $totalCount += $this->opinionRepository->countTrashedContributionsByStep($step);

            $totalCount += $this->argumentRepository->countPublishedArgumentsByStep($step);
            $totalCount += $this->argumentRepository->countTrashedArgumentsByStep($step);

            $totalCount += $this->opinionVersionRepository->countPublishedOpinionVersionByStep(
                $step
            );
            $totalCount += $this->opinionVersionRepository->countTrashedOpinionVersionByStep($step);

            $totalCount += $this->sourceRepository->countPublishedSourcesByStep($step);
            $totalCount += $this->sourceRepository->countTrashedSourcesByStep($step);
        } elseif ($step instanceof CollectStep) {
            $totalCount += $this->proposalRepository->countPublishedProposalByStep($step);
            // We do not account votes as a contribution, maybe this will change
            // $totalCount += $this->proposalCollectVoteRepository->countPublishedCollectVoteByStep(
            //     $step
            // );
        } elseif ($step instanceof QuestionnaireStep) {
            $totalCount += $this->replyRepository->countRepliesByStep($step);
        }
        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
