<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\DTO\DebateAnonymousParticipationHashData;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Encoder\DebateAnonymousParticipationHashEncoder;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Validator\Constraints\CheckDebateAnonymousParticipationHashConstraint;
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
    private DebateAnonymousParticipationHashEncoder $encoder;
    private DebateAnonymousVoteRepository $repository;
    private DebateAnonymousArgumentRepository $argumentRepository;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        DebateAnonymousVoteRepository $repository,
        DebateAnonymousArgumentRepository $argumentRepository,
        ValidatorInterface $validator,
        DebateAnonymousParticipationHashEncoder $encoder,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->validator = $validator;
        $this->indexer = $indexer;
        $this->encoder = $encoder;
        $this->repository = $repository;
        $this->argumentRepository = $argumentRepository;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Arg $input): array
    {
        try {
            $debate = $this->checkDebate($input->offsetGet('debateId'));
            $voteId = $this->removeVote($input, $debate);
            $this->indexer->remove(DebateAnonymousVote::class, $voteId);
            $argumentId = $this->removeArgumentIfAny($input, $debate);
            if ($argumentId) {
                $this->indexer->remove(DebateAnonymousArgument::class, $argumentId);
            }
            $this->em->flush();
            $this->indexer->finishBulk();
        } catch (UserError $error) {
            return $this->generateErrorPayload($error->getMessage());
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new \Exception('Internal error, please try again.');
        }

        return $this->generateSuccessFulPayload($debate, $voteId, $argumentId);
    }

    private function generateSuccessFulPayload(
        Debate $debate,
        string $voteId,
        ?string $argumentId = null
    ): array {
        return [
            'debate' => $debate,
            'deletedDebateAnonymousVoteId' => GlobalId::toGlobalId('DebateAnonymousVote', $voteId),
            'deletedDebateAnonymousArgumentId' => $argumentId
                ? GlobalId::toGlobalId('DebateAnonymousArgument', $argumentId)
                : null,
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

    private function checkDebate(string $debateId): Debate
    {
        $debate = $this->globalIdResolver->resolve($debateId, null);

        if (!$debate || !$debate instanceof Debate) {
            $this->logger->error('Unknown argument `debateId`.', ['id' => $debateId]);

            throw new UserError(self::UNKNOWN_DEBATE);
        }

        if (!$debate->getStep() || !$debate->getStep()->isOpen()) {
            $this->logger->error('The debate is not open.', ['id' => $debateId]);

            throw new UserError(self::CLOSED_DEBATE);
        }

        return $debate;
    }

    private function removeVote(Arg $input, Debate $debate): string
    {
        $vote = $this->getVoteFromHashData($this->checkAndDecodeHash($input->offsetGet('hash')));
        if ($vote->getDebate() !== $debate) {
            throw new UserError(self::INVALID_HASH);
        }
        $this->em->remove($vote);

        return $vote->getId();
    }

    private function removeArgumentIfAny(Arg $input, Debate $debate): ?string
    {
        $hash = $input->offsetGet('argumentHash');
        if ($hash) {
            $argument = $this->argumentRepository->findOneByHashData(
                $this->checkAndDecodeHash($hash)
            );
            if ($argument->getDebate() !== $debate) {
                throw new UserError(self::INVALID_HASH);
            }
            $this->em->remove($argument);

            return $argument->getId();
        }

        return null;
    }

    private function checkAndDecodeHash(string $hash): DebateAnonymousParticipationHashData
    {
        $errors = $this->validator->validate($hash, [
            new CheckDebateAnonymousParticipationHashConstraint(),
        ]);
        if (\count($errors) > 0) {
            throw new UserError(self::INVALID_HASH);
        }

        return $this->encoder->decode($hash);
    }

    private function getVoteFromHashData(
        DebateAnonymousParticipationHashData $hashData
    ): DebateAnonymousVote {
        $vote = $this->repository->findOneBy([
            'token' => $hashData->getToken(),
            'type' => $hashData->getType(),
        ]);
        if (!$vote) {
            throw new UserError(self::NOT_VOTED);
        }

        return $vote;
    }
}
