<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Repository\ProposalAnalysisCommentRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProposalAnalysisCommentsResolver implements QueryInterface
{
    private readonly ProposalAnalysisCommentRepository $proposalAnalysisCommentRepository;

    public function __construct(ProposalAnalysisCommentRepository $proposalAnalysisCommentRepository)
    {
        $this->proposalAnalysisCommentRepository = $proposalAnalysisCommentRepository;
    }

    public function __invoke(
        ProposalAnalysis $proposalAnalysis,
        ?Argument $args = null
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $comments = $this->proposalAnalysisCommentRepository->findBy(['proposalAnalysis' => $proposalAnalysis], ['createdAt' => 'DESC']);
        $paginator = new Paginator(function () use (
            $comments
        ) {
            return $comments;
        });

        $totalCount = $this->proposalAnalysisCommentRepository->countByProposalAnalysis($proposalAnalysis);

        return $paginator->auto($args, $totalCount);
    }
}
