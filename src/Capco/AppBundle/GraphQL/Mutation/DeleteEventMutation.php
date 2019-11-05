<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\EventCommentRepository;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Sonata\MediaBundle\Provider\ImageProvider;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteEventMutation extends BaseDeleteMutation
{
    private $globalIdResolver;
    private $indexer;
    private $publisher;
    private $registration;
    private $eventCommentRepository;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer,
        Publisher $publisher,
        EventRegistrationRepository $registration,
        EventCommentRepository $eventCommentRepository,
        ImageProvider $mediaProvider
    ) {
        parent::__construct($em, $mediaProvider);
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
        $this->publisher = $publisher;
        $this->registration = $registration;
        $this->eventCommentRepository = $eventCommentRepository;
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

        $eventParticipants = $this->registration->getAllParticipantsInEvent($event);
        $eventMedia = $event->getMedia();
        if ($eventMedia) {
            $this->removeMedia($eventMedia);
        }

        $event->softDelete();

        $this->em
            ->createQueryBuilder()
            ->delete(EventRegistration::class, 'er')
            ->andWhere('er.event = :event')
            ->setParameter('event', $event)
            ->getQuery()
            ->getResult();

        $this->em
            ->createQueryBuilder()
            ->delete(EventComment::class, 'ec')
            ->andWhere('ec.Event = :event')
            ->setParameter('event', $event)
            ->getQuery()
            ->getResult();

        $this->em->flush();
        $this->indexer->remove(\get_class($event), $id);
        $this->indexer->finishBulk();

        if ($viewer->isAdmin()) {
            $this->publisher->publish(
                'event.delete',
                new Message(
                    json_encode([
                        'eventId' => $event->getId(),
                        'eventParticipants' => $eventParticipants
                    ])
                )
            );
        }

        return [
            'event' => $event,
            'deletedEventId' => $id,
            'userErrors' => $userErrors
        ];
    }
}
