<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class RemoveDebateVoteMutation implements MutationInterface
{
    use MutationTrait;

    final public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    final public const CLOSED_DEBATE = 'CLOSED_DEBATE';
    final public const NO_VOTE_FOUND = 'NO_VOTE_FOUND';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly DebateVoteRepository $voteRepository,
        private readonly DebateArgumentRepository $argumentRepository,
        private readonly Indexer $indexer
    ) {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $debateId = $input->offsetGet('debateId');
        $debate = $this->globalIdResolver->resolve($debateId, $viewer);

        if (!$debate || !($debate instanceof Debate)) {
            $this->logger->error('Unknown argument `debateId`.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::UNKNOWN_DEBATE);
        }

        if (!$debate->viewerCanParticipate($viewer)) {
            $this->logger->error('The debate is not open.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::CLOSED_DEBATE);
        }

        $previousVote = $this->voteRepository->getOneByDebateAndUser($debate, $viewer);

        if (!$previousVote) {
            $this->logger->error('No vote found for `debateId` and viewer.', [
                'id' => $debateId,
                'viewer' => $viewer->getId(),
            ]);

            return $this->generateErrorPayload(self::NO_VOTE_FOUND);
        }

        $previousVoteId = $previousVote->getId();
        $previousArgumentId = null;
        $previousArgument = $this->argumentRepository->getOneByDebateAndUser($debate, $viewer);

        // We also delete the debate argument of the user, if any.
        if ($previousArgument) {
            $previousArgumentId = $previousArgument->getId();
            $this->em->remove($previousArgument);
        }

        try {
            $this->em->remove($previousVote);
            $this->em->flush();
            if ($previousArgumentId) {
                $this->indexer->remove(DebateArgument::class, $previousArgumentId);
            }
            $this->indexer->remove(DebateVote::class, $previousVoteId);
            $this->indexer->finishBulk();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new UserError('Internal error, please try again.');
        }

        return $this->generateSuccessFulPayload($debate, $previousVoteId, $previousArgumentId);
    }

    private function generateSuccessFulPayload(
        Debate $debate,
        string $voteId,
        ?string $argumentId
    ): array {
        return [
            'deletedArgumentId' => $argumentId
                ? GlobalId::toGlobalId('DebateArgument', $argumentId)
                : null,
            'deletedVoteId' => GlobalId::toGlobalId('DebateVote', $voteId),
            'debate' => $debate,
            'errorCode' => null,
        ];
    }

    private function generateErrorPayload(string $message): array
    {
        return [
            'deletedArgumentId' => null,
            'deletedVoteId' => null,
            'debate' => null,
            'errorCode' => $message,
        ];
    }
}
