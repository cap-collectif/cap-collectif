<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class StepContributionsResolver implements ResolverInterface
{
    protected $opinionRepository;
    protected $sourceRepository;
    protected $argumentRepository;
    protected $opinionVersionRepository;
    protected $proposalRepository;
    protected $proposalCollectVoteRepository;
    protected $replyRepository;

    public function __construct(
        OpinionRepository $opinionRepository,
        SourceRepository $sourceRepository,
        ArgumentRepository $argumentRepository,
        OpinionVersionRepository $opinionVersionRepository,
        ProposalRepository $proposalRepository,
        ReplyRepository $replyRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository
    ) {
        $this->opinionRepository = $opinionRepository;
        $this->sourceRepository = $sourceRepository;
        $this->argumentRepository = $argumentRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->proposalRepository = $proposalRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->replyRepository = $replyRepository;
    }

    public function __invoke(AbstractStep $step, Argument $args): Connection
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
            $totalCount += $this->proposalCollectVoteRepository->countPublishedCollectVoteByStep(
                $step
            );
        } elseif ($step instanceof QuestionnaireStep) {
            $totalCount += $this->replyRepository->countRepliesByStep($step);
        }
        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
