<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Argument;
use Doctrine\Common\Util\ClassUtils;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\Broker\Message;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\ArgumentType;
use Symfony\Component\Form\FormFactoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;

class ChangeArgumentMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private ArgumentRepository $argumentRepo;
    private FormFactoryInterface $formFactory;
    private RedisStorageHelper $redisStorage;
    private Publisher $publisher;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ArgumentRepository $argumentRepo,
        RedisStorageHelper $redisStorage,
        Publisher $publisher,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->argumentRepo = $argumentRepo;
        $this->redisStorage = $redisStorage;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $user): array
    {
        $argumentGlobalId = $input->offsetGet('argumentId');
        $argumentId = GlobalId::fromGlobalId($argumentGlobalId)['id'];
        $argument = $this->argumentRepo->find($argumentId);

        if (!$argument) {
            throw new UserError('Unknown argument with id: ' . $argumentId);
        }

        if ($user !== $argument->getAuthor()) {
            throw new UserError("Can't update the argument of someone else.");
        }

        if (!$argument->canContribute($user)) {
            throw new UserError("Can't update uncontributable argument.");
        }

        $values = $input->getArrayCopy();
        unset($values['argumentId']);

        $form = $this->formFactory->create(ArgumentType::class, $argument);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $argument = $this->resetVotes($argument);

        $this->em->flush();
        $this->indexer->finishBulk();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::ARGUMENT_UPDATE,
            new Message(json_encode(['argumentId' => $argument->getId()]))
        );

        return ['argument' => $argument];
    }

    private function resetVotes(Argument $argument): Argument
    {
        foreach ($argument->getVotes() as $vote) {
            $this->indexer->remove(ClassUtils::getClass($vote), $vote->getId());
        }
        $argument->resetVotes();

        return $argument;
    }
}
