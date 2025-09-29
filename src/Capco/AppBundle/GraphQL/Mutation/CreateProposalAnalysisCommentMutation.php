<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProposalAnalysisCommentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateProposalAnalysisCommentMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly Publisher $publisher
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $proposalAnalysisId = $input->offsetGet('proposalAnalysisId');
        $body = $input->offsetGet('body');

        $proposalAnalysis = $this->getProposalAnalysis($proposalAnalysisId, $viewer);

        $proposalAnalysisComment = new ProposalAnalysisComment();
        $proposalAnalysisComment->setBody($body);
        $proposalAnalysisComment->setProposalAnalysis($proposalAnalysis);
        $proposalAnalysisComment->setAuthor($viewer);

        $this->em->persist($proposalAnalysisComment);
        $this->em->flush();

        $this->sendNotificationEmail($proposalAnalysisComment, $viewer);

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

    private function sendNotificationEmail(
        ProposalAnalysisComment $proposalAnalysisComment,
        User $viewer
    ): void {
        $proposalAnalysis = $proposalAnalysisComment->getProposalAnalysis();
        $emailsRecipients = [];

        foreach ($proposalAnalysis->getConcernedUsers()->toArray() as $user) {
            if ($user !== $viewer) {
                $emailsRecipients[] = $user->getEmail();
            }
        }

        $this->publisher->publish(
            'comment.proposal_analysis_create',
            new Message(
                json_encode([
                    'commentId' => $proposalAnalysisComment->getId(),
                    'emailsRecipients' => $emailsRecipients,
                ])
            )
        );
    }
}
