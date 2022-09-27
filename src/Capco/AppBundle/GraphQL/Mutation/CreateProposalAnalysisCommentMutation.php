<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Security\ProposalAnalysisCommentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateProposalAnalysisCommentMutation implements MutationInterface
{
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $proposalAnalysisId = $input->offsetGet('proposalAnalysisId');
        $body = $input->offsetGet('body');

        $proposalAnalysis = $this->getProposalAnalysis($proposalAnalysisId, $viewer);

        $proposalAnalysisComment = new ProposalAnalysisComment();
        $proposalAnalysisComment->setBody($body);
        $proposalAnalysisComment->setProposalAnalysis($proposalAnalysis);
        $proposalAnalysisComment->setAuthor($viewer);

        // todo send email

        $this->em->persist($proposalAnalysisComment);
        $this->em->flush();

        return ['comment' => $proposalAnalysisComment];
    }

    public function isGranted(string $proposalAnalysisId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $proposalAnalysisComment = new ProposalAnalysisComment();
        $proposalAnalysis = $this->getProposalAnalysis($proposalAnalysisId, $viewer);
        $proposalAnalysisComment->setProposalAnalysis($proposalAnalysis);

        return $this->authorizationChecker->isGranted(
            ProposalAnalysisCommentVoter::CREATE,
            $proposalAnalysisComment
        );
    }

    private function getProposalAnalysis(string $proposalAnalysisId, User $viewer)
    {
        $proposalAnalysis = $this->globalIdResolver->resolve($proposalAnalysisId, $viewer);

        if (!$proposalAnalysis) {
            throw new UserError("ProposalAnalysis with id {$proposalAnalysisId} was not found.");
        }

        return $proposalAnalysis;
    }
}
