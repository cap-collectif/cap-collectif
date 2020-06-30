<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UnsubscribeToEventAsNonRegisteredMutation implements MutationInterface
{
    private GlobalIdResolver $globalIdResolver;
    private EventRegistrationRepository $eventRegistrationRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager,
        EventRegistrationRepository $eventRegistrationRepository
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->entityManager = $entityManager;
        $this->eventRegistrationRepository = $eventRegistrationRepository;
    }

    public function __invoke(Arg $input, $viewer): array
    {
        $eventId = $input->offsetGet('eventId');
        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($eventId, $viewer);
        $registration = null;

        $email = $input->offsetGet('email');
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

        return [
            'eventId' => $eventId,
        ];
    }
}
