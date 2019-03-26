<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalEvaluationResolver implements ResolverInterface
{
    private $isViewerAnEvaluerResolver;

    public function __construct(IsViewerAnEvaluerResolver $isViewerAnEvaluerResolver)
    {
        $this->isViewerAnEvaluerResolver = $isViewerAnEvaluerResolver;
    }

    public function __invoke(
        ProposalEvaluation $evaluation,
        $user,
        \ArrayObject $context
    ): Collection {
        $isEvaluer = $this->isViewerAnEvaluerResolver->__invoke($evaluation->getProposal(), $user);
        $viewerCanSeePrivateResponses =
            $isEvaluer ||
            ($user instanceof User && $user->isAdmin()) ||
            ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));

        return $evaluation
            ->getResponses()
            ->filter(function ($response) use ($viewerCanSeePrivateResponses) {
                return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
            });
    }
}
