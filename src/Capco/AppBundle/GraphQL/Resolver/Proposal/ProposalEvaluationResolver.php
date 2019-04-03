<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalEvaluationResolver implements ResolverInterface
{
    private $proposalResolver;

    public function __construct(ProposalResolver $proposalResolver)
    {
        $this->proposalResolver = $proposalResolver;
    }

    public function __invoke(
        ProposalEvaluation $evaluation,
        $user,
        \ArrayObject $context
    ): Collection {
        $isEvaluer = $this->proposalResolver->resolveViewerIsEvaluer(
            $evaluation->getProposal(),
            $user
        );
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
