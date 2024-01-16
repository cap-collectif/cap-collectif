<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UnsubscribeToEventAsRegisteredMutation implements MutationInterface
{
    use MutationTrait;
    private GlobalIdResolver $globalIdResolver;
    private EventRegistrationRepository $eventRegistrationRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager,
        EventRegistrationRepository $eventRegistrationRepository
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->eventRegistrationRepository = $eventRegistrationRepository;
        $this->entityManager = $entityManager;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $eventId = $input->offsetGet('eventId');
        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($eventId, $viewer);
        $registration = null;
        if ($event) {
            $registration = $this->eventRegistrationRepository->getOneByUserAndEvent(
                $viewer,
                $event
            );
        }
        if (!$registration) {
            throw new UserError('Event or user registration not found.');
        }

        $this->entityManager->remove($registration);
        $this->entityManager->flush();

        return [
            'event' => $event,
        ];
    }

    public function tryToUnsubscribeFromEventWithEmail(?Event $event, string $email): void
    {
        $registration = null;
        if ($event) {
            $registration = $this->eventRegistrationRepository->getOneByUserEmailAndEvent(
                $email,
                $event
            );
        }
        if (!$registration) {
            throw new UserError('Event or user registration not found.');
        }

        $this->entityManager->remove($registration);
        $this->entityManager->flush();
    }
}
