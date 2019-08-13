<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalViewerCanSeeEvaluationResolver implements ResolverInterface
{
    private $isViewerAnEvaluerResolver;

    public function __construct(IsViewerAnEvaluerResolver $isViewerAnEvaluerResolver)
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
