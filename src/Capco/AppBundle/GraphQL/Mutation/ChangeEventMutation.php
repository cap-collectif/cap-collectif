<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\EventType;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class ChangeEventMutation implements MutationInterface
{
    private $em;
    private $globalIdResolver;
    private $formFactory;
    private $logger;
    private $indexer;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        Indexer $indexer
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $values = $input->getRawArguments();

        if (isset($values['customCode']) && !empty($values['customCode']) && !$viewer->isAdmin()) {
            return [
                'event' => null,
                'userErrors' => [['message' => 'You are not authorized to add customCode field.']]
            ];
        }

        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($values['id'], $viewer);
        if (!$event) {
            return [
                'event' => null,
                'userErrors' => [['message' => 'Could not find your event.']]
            ];
        }
        unset($values['id']);
        /** @var User $newAuthor */
        $newAuthor = isset($values['author'])
            ? $this->globalIdResolver->resolve($values['author'], $viewer)
            : null;

        // admin and superAdmin can change the event's author
        if (
            $newAuthor &&
            ($viewer->isAdmin() || $viewer->isSuperAdmin()) &&
            $newAuthor !== $event->getAuthor()
        ) {
            $event->setAuthor($newAuthor);
            unset($values['author']);
        }

        $form = $this->formFactory->create(EventType::class, $event);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        $this->indexer->index(\get_class($event), $event->getId());
        $this->indexer->finishBulk();

        return ['event' => $event, 'userErrors' => []];
    }
}
