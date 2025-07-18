<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\EventRegistrationRepository;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class SubscribeToEventAsRegisteredMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EventRegistrationRepository $eventRegistrationRepository, private readonly GlobalIdResolver $globalIdResolver, private readonly EntityManagerInterface $entityManager, private readonly RequestGuesserInterface $requestGuesser)
    {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $eventId = $input->offsetGet('eventId');
        $isPrivate = $input->offsetGet('private');

        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($eventId, $viewer);
        if (!$event) {
            throw new BadRequestHttpException("Not valid event id {$eventId}");
        }
        $email = $viewer->getEmail();
        $username = $viewer->getUsername();

        $eventRegistration = $this->eventRegistrationRepository->getOneByUserEmailAndEvent(
            $email,
            $event
        );

        if ($eventRegistration) {
            throw new UserError('User is already registered for this event.');
        }
        if ($event->isRegistrationComplete()) {
            throw new UserError('Event is complete');
        }
        $eventRegistration = new EventRegistration($event);
        $eventRegistration
            ->setPrivate($isPrivate)
            ->setUser($viewer)
            ->setUsername($username)
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setEmail($email)
            ->setConfirmed(true)
        ;

        $this->entityManager->persist($eventRegistration);
        $this->entityManager->flush();

        return [
            'event' => $event,
        ];
    }
}
