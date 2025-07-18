<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class AddDebateVoteMutation implements MutationInterface
{
    use MutationTrait;

    final public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    final public const CLOSED_DEBATE = 'CLOSED_DEBATE';

    public function __construct(private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly GlobalIdResolver $globalIdResolver, private readonly DebateVoteRepository $repository, private readonly Indexer $indexer, private readonly RequestGuesserInterface $requestGuesser)
    {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $debateId = $input->offsetGet('debateId');
        $debate = $this->globalIdResolver->resolve($debateId, $viewer);

        if (!$debate || !$debate instanceof Debate) {
            $this->logger->error('Unknown argument `debateId`.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::UNKNOWN_DEBATE);
        }

        if (!$debate->viewerCanParticipate($viewer)) {
            $this->logger->error('The debate is not open.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::CLOSED_DEBATE);
        }

        $type = $input->offsetGet('type');
        $debateVote = (new DebateVote())->setDebate($debate)->setType($type);
        $this->setAuthor($debateVote, $viewer);
        self::setOrigin($debateVote, $input);

        $previousVote = $this->repository->getOneByDebateAndUser($debate, $viewer);
        $previousVoteId = null;
        if ($previousVote) {
            $previousVoteId = $previousVote->getId();
            $this->em->remove($previousVote);
            $this->em->flush();
        }
        $this->em->persist($debateVote);

        try {
            $this->em->flush();
            if ($previousVoteId) {
                $this->indexer->remove(DebateVote::class, $previousVoteId);
            }
            $this->indexer->index(DebateVote::class, $debateVote->getId());
            $this->indexer->finishBulk();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new UserError('Internal error, please try again.');
        }

        return $this->generateSuccessFulPayload($debateVote, $previousVoteId);
    }

    private function generateSuccessFulPayload(DebateVote $vote, ?string $previousVoteId): array
    {
        return [
            'debateVote' => $vote,
            'previousVoteId' => $previousVoteId
                ? GlobalId::toGlobalId('DebateVote', $previousVoteId)
                : null,
            'errorCode' => null,
        ];
    }

    private function generateErrorPayload(string $message): array
    {
        return ['debateVote' => null, 'previousVoteId' => null, 'errorCode' => $message];
    }

    private function setAuthor(DebateVote $vote, User $viewer): DebateVote
    {
        return $vote
            ->setUser($viewer)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
        ;
    }

    private static function setOrigin(DebateVote $vote, Arg $input): DebateVote
    {
        $widgetOriginURI = $input->offsetGet('widgetOriginURI');
        if ($widgetOriginURI) {
            $vote->setWidgetOriginUrl($widgetOriginURI);
        }

        return $vote;
    }
}
