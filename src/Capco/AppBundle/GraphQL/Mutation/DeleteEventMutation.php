<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteEventMutation implements MutationInterface
{
    private $em;
    private $globalIdResolver;
    private $indexer;
    private $publisher;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('eventId');
        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($id, $viewer);
        $userErrors = [];
        if (!$event) {
            $userErrors = ['This event doesnt exist.'];
        }

        if ($viewer !== $event->getAuthor() && (!$viewer->isAdmin() || !$viewer->isSuperAdmin())) {
            throw new UserError('You are not authorized to delete this event');
        }

        $this->em->remove($event);
        $this->em->flush();

        $this->indexer->remove(\get_class($event), $id);
        $this->indexer->finishBulk();

        $this->publisher->publish(
            'event.delete',
            new Message(
                json_encode([
                    'eventId' => $event->getId()
                ])
            )
        );

        return [
            'deletedEventId' => $id,
            'userErrors' => $userErrors
        ];
    }
}
