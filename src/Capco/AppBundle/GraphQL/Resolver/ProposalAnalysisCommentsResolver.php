<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Repository\ProposalAnalysisCommentRepository ;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProposalAnalysisCommentsResolver implements ResolverInterface
{
    private ProposalAnalysisCommentRepository $proposalAnalysisCommentRepository;

    public function __construct(ProposalAnalysisCommentRepository $proposalAnalysisCommentRepository)
    {
        $this->proposalAnalysisCommentRepository = $proposalAnalysisCommentRepository;
    }

    public function __invoke(
        ProposalAnalysis $proposalAnalysis,
        Argument $args = null
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $paginator = new Paginator(function () use (
            $proposalAnalysis
        ) {
            return $this->proposalAnalysisCommentRepository->findBy(['proposalAnalysis' => $proposalAnalysis]);
        });

        $totalCount = 0;

        return $paginator->auto($args, $totalCount);
    }
}
