<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveEventMutation implements MutationInterface
{
    private $em;
    private $eventRepository;
    private $indexer;

    public function __construct(
        EntityManagerInterface $em,
        EventRepository $eventRepository,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->eventRepository = $eventRepository;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('eventId');
        /** @var Event $event */
        $event = $this->eventRepository->find($id);

        if (!$event) {
            throw new UserError('This event doesnt exist.');
        }

        if ($viewer !== $event->getAuthor() && (!$viewer->isAdmin() || !$viewer->isSuperAdmin())) {
            throw new UserError('You are not available to delete this event');
        }

        $this->em->remove($event);
        $this->em->flush();

        $this->indexer->remove(\get_class($event), $id);
        $this->indexer->finishBulk();

        return [
            'deletedEventId' => $id,
            'viewer' => $viewer
        ];
    }
}
