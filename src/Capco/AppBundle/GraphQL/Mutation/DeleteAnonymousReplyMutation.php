<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteAnonymousReplyMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private ReplyAnonymousRepository $replyAnonymousRepository;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->replyAnonymousRepository = $replyAnonymousRepository;
        $this->indexer = $indexer;
    }

    public function __invoke(Argument $args): array
    {
        $hashedToken = $args->offsetGet('hashedToken');
        $decodedToken = base64_decode($hashedToken);
        $reply = $this->replyAnonymousRepository->findOneBy(['token' => $decodedToken]);

        if (!$reply) {
            throw new UserError('Reply not found');
        }

        $replyId = GlobalId::toGlobalId('Reply', $reply->getId());
        $questionnaire = $reply->getQuestionnaire();

        $this->indexer->remove(AbstractReply::class, $reply->getId());
        $this->indexer->finishBulk();

        $this->em->remove($reply);
        $this->em->flush();

        return ['replyId' => $replyId, 'questionnaire' => $questionnaire];
    }
}
