<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

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
        FormFactory $formFactory,
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

        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($values['id'], $viewer);
        if (!$event) {
            return [
                'eventEdge' => null,
                'userErrors' => [['message' => 'Could not find your event.']]
            ];
        }
        unset($values['id']);
        $newAuthor = null;
        if (isset($values['author'])) {
            /** @var User $newAuthor */
            $newAuthor = $this->globalIdResolver->resolve($values['author'], $viewer);

            if (
                $viewer->isAdmin() ||
                ($viewer->isSuperAdmin() && $newAuthor && $newAuthor !== $event->getAuthor())
            ) {
                $event->setAuthor($newAuthor);
                unset($values['author']);
            }
        }

        // clear empty/null values
        $values = array_filter($values);

        $form = $this->formFactory->create(EventType::class, $event);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' ' . $form->getErrors()->__toString());
            $this->logger->debug(
                __METHOD__ . ' : extra data = ' . var_export($form->getExtraData(), true)
            );

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        $this->indexer->index(\get_class($event), $event->getId());
        $this->indexer->finishBulk();

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $event);

        return ['eventEdge' => $edge, 'userErrors' => []];
    }
}
