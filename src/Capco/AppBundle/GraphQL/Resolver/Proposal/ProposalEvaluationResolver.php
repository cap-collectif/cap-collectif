<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;

class ProposalEvaluationResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    private $isViewerAnEvaluerResolver;

    public function __construct(
        IsViewerAnEvaluerResolver $isViewerAnEvaluerResolver,
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository
    ) {
        $this->isViewerAnEvaluerResolver = $isViewerAnEvaluerResolver;
        $this->abstractQuestionRepository = $abstractQuestionRepository;
        $this->abstractResponseRepository = $abstractResponseRepository;
    }

    public function __invoke(
        ProposalEvaluation $evaluation,
        $viewer,
        \ArrayObject $context
    ): Collection {
        $isEvaluer = $this->isViewerAnEvaluerResolver->__invoke($evaluation->getProposal(), $viewer);
        
        $viewerCanSeePrivateResponses =
            $isEvaluer ||
            ($viewer instanceof User && $viewer->isAdmin()) ||
            ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));
        
        return $this->getResponsesForEvaluation($evaluation)->filter(function ($response) use (
            $viewerCanSeePrivateResponses
        ) {
            return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
        });
    }
}
