<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Encoder\DebateAnonymousVoteHashEncoder;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Validator\Constraints\CheckDebateAnonymousVoteHashConstraint;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RemoveDebateAnonymousVoteMutation implements MutationInterface
{
    public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    public const CLOSED_DEBATE = 'CLOSED_DEBATE';
    public const INVALID_HASH = 'INVALID_HASH';
    public const NOT_VOTED = 'NOT_VOTED';

    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private ValidatorInterface $validator;
    private Indexer $indexer;
    private DebateAnonymousVoteHashEncoder $encoder;
    private DebateAnonymousVoteRepository $repository;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        DebateAnonymousVoteRepository $repository,
        ValidatorInterface $validator,
        DebateAnonymousVoteHashEncoder $encoder,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->validator = $validator;
        $this->indexer = $indexer;
        $this->encoder = $encoder;
        $this->repository = $repository;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Arg $input): array
    {
        $debateId = $input->offsetGet('debateId');
        $debate = $this->globalIdResolver->resolve($debateId, null);

        if (!$debate || !$debate instanceof Debate) {
            $this->logger->error('Unknown argument `debateId`.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::UNKNOWN_DEBATE);
        }

        if (!$debate->getStep() || !$debate->getStep()->isOpen()) {
            $this->logger->error('The debate is not open.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::CLOSED_DEBATE);
        }

        $hash = $input->offsetGet('hash');
        $errors = $this->validator->validate($hash, [new CheckDebateAnonymousVoteHashConstraint()]);
        if (\count($errors) > 0) {
            return $this->generateErrorPayload(self::INVALID_HASH);
        }
        $decoded = $this->encoder->decode($hash);
        $vote = $this->repository->findOneBy([
            'token' => $decoded->getToken(),
            'type' => $decoded->getType(),
        ]);
        if (!$vote) {
            return $this->generateErrorPayload(self::NOT_VOTED);
        }

        try {
            $this->em->remove($vote);
            $this->em->flush();
            $this->indexer->remove(DebateAnonymousVote::class, $vote->getId());
            $this->indexer->finishBulk();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new UserError('Internal error, please try again.');
        }

        return $this->generateSuccessFulPayload($vote);
    }

    private function generateSuccessFulPayload(DebateAnonymousVote $vote): array
    {
        return [
            'debate' => $vote->getDebate(),
            'deletedDebateAnonymousVoteId' => GlobalId::toGlobalId(
                'DebateAnonymousVote',
                $vote->getId()
            ),
            'errorCode' => null,
        ];
    }

    private function generateErrorPayload(string $message): array
    {
        return [
            'debate' => null,
            'deletedDebateAnonymousVoteId' => null,
            'errorCode' => $message,
        ];
    }
}
