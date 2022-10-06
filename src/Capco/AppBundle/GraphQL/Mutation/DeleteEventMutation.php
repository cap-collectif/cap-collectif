<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\AppBundle\Security\EventVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Sonata\MediaBundle\Provider\ImageProvider;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteEventMutation extends BaseDeleteMutation
{
    private GlobalIdResolver $globalIdResolver;
    private Indexer $indexer;
    private Publisher $publisher;
    private EventRegistrationRepository $registration;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer,
        Publisher $publisher,
        EventRegistrationRepository $registration,
        ImageProvider $mediaProvider,
        AuthorizationCheckerInterface $authorizationChecker,
        HighlightedContentRepository $highlightedContentRepository
    ) {
        parent::__construct($em, $mediaProvider);
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
        $this->publisher = $publisher;
        $this->registration = $registration;
        $this->authorizationChecker = $authorizationChecker;
        $this->highlightedContentRepository = $highlightedContentRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('eventId');
        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($id, $viewer);

        $owner = $event->getOwner();

        $eventParticipants = $this->registration->getAllParticipantsInEvent($event);
        $eventMedia = $event->getMedia();
        if ($eventMedia) {
            $this->removeMedia($eventMedia);
        }
        if ($event->getReview()) {
            $this->em
                ->createQueryBuilder()
                ->delete(EventReview::class, 'er')
                ->andWhere('er.id = :id')
                ->setParameter('id', $event->getReview()->getId())
                ->getQuery()
                ->getResult();
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

        if ($owner) {
            $event->setOwner($owner);
        }

        $highlightedContents = $this->highlightedContentRepository->findByEvent($event);
        foreach ($highlightedContents => $highlightedContent) {
            $this->em->delete($highlightedContent);
        }
        $this->em->flush();

        $this->indexer->index(Event::class, $event->getId());
        $this->indexer->finishBulk();

        $this->publisher->publish(
            'event.delete',
            new Message(
                json_encode([
                    'eventId' => $event->getId(),
                    'eventParticipants' => $eventParticipants,
                ])
            )
        );

        return [
            'event' => $event,
            'deletedEventId' => $id,
        ];
    }

    public function isGranted(string $eventId, User $viewer): bool
    {
        $event = $this->globalIdResolver->resolve($eventId, $viewer);

        if (!$event) {
            return false;
        }

        return $this->authorizationChecker->isGranted(EventVoter::DELETE, $event);
    }
}
