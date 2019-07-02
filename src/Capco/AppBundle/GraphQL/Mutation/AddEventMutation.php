<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Doctrine\DBAL\Exception\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;

class AddEventMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;
    private $indexer;
    private $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $values = $input->getRawArguments();

        /** @var User $user */
        $user = isset($values['author'])
            ? $this->globalIdResolver->resolve($values['author'], $viewer)
            : null;

        // from BO
        if ($user && ($viewer->isAdmin() || $viewer->isSuperAdmin())) {
            $event = (new Event())->setAuthor($user);
            unset($values['author']);
        } else {
            // from FO
            $event = (new Event())->setAuthor($viewer);
        }

        // clear empty/null values
        $values = array_filter($values);

        $form = $this->formFactory->create(EventType::class, $event);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' ' . $form->getErrors(true)->__toString());
            $this->logger->debug(
                __METHOD__ . ' : extra data = ' . var_export($form->getExtraData(), true)
            );

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($event);
            $this->em->flush();
        } catch (DriverException $e) {
            // Updating opinion votes count failed
            throw new UserError($e->getMessage());
        }

        $this->indexer->index(\get_class($event), $event->getId());
        $this->indexer->finishBulk();

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $event);

        return ['eventEdge' => $edge, 'userErrors' => []];
    }
}
