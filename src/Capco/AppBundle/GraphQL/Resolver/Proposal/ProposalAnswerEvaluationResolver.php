<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * @deprecated this is our legacy evaluation tool
 */
class ProposalAnswerEvaluationResolver implements QueryInterface
{
    public function __invoke(Proposal $proposal): ?ProposalEvaluation
    {
        return $proposal->getProposalEvaluation();
    }
}
