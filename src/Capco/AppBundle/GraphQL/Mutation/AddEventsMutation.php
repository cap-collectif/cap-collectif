<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddEventsMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $userRepo;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        UserRepository $userRepo
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->userRepo = $userRepo;
    }

    public function __invoke(Arg $input): array
    {
        $importedEvents = [];
        foreach ($input->offsetGet('events') as $eventInput) {
            $author = $this->userRepo->findOneByEmail($eventInput['authorEmail']);
            unset($eventInput['authorEmail']);

            $event = (new Event())->setAuthor($author);

            $form = $this->formFactory->create(EventType::class, $event);
            $form->submit($eventInput, false);

            if (!$form->isValid()) {
                throw GraphQLException::fromFormErrors($form);
            }

            $this->em->persist($event);

            $importedEvents[] = $event;
        }

        if (false === $input->offsetGet('dryRun')) {
            $this->em->flush();
        }

        return ['importedEvents' => $importedEvents, 'userErrors' => []];
    }
}
