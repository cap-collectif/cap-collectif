<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

/**
 * @deprecated This is our legacy evaluation tool.
 */
class ProposalViewerCanSeeEvaluationResolver implements ResolverInterface
{
    private $isViewerAnEvaluerResolver;

    public function __construct(ProposalViewerIsAnEvaluerResolver $isViewerAnEvaluerResolver)
    {
        $this->isViewerAnEvaluerResolver = $isViewerAnEvaluerResolver;
    }

    public function __invoke(Proposal $proposal, $viewer): bool
    {
        $evalForm = $proposal->getProposalForm()->getEvaluationForm();

        return null !== $evalForm &&
            (!$evalForm->isFullyPrivate() ||
                $this->isViewerAnEvaluerResolver->__invoke($proposal, $viewer));
    }
}
