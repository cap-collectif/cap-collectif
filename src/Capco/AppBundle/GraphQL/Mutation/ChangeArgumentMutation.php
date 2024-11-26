<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Form\ArgumentType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class ChangeArgumentMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly ArgumentRepository $argumentRepo;
    private readonly FormFactoryInterface $formFactory;
    private readonly RedisStorageHelper $redisStorage;
    private readonly Publisher $publisher;
    private readonly Indexer $indexer;

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
        $this->formatInput($input);
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
