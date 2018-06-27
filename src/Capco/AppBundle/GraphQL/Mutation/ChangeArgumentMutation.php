<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Form\ArgumentType;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Symfony\Component\Form\FormFactory;

class ChangeArgumentMutation
{
    private $em;
    private $argumentRepo;
    private $formFactory;
    private $redisStorage;
    private $publisher;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, ArgumentRepository $argumentRepo, RedisStorageHelper $redisStorage, $publisher)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->argumentRepo = $argumentRepo;
        $this->redisStorage = $redisStorage;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, User $user): array
    {
        $argumentId = $input->offsetGet('argument');
        $argument = $this->argumentRepo->find($argumentId);

        if (!$argument) {
            throw new UserError('Unknown argument with id: ' . $argumentId);
        }

        if ($user !== $argument->getAuthor()) {
            throw new UserError("Can't update uncontributable argument.");
        }

        if (!$argument->canContribute()) {
            throw new UserError("Can't update uncontributable argument.");
        }

        $values = $input->getRawArguments();
        unset($values['argumentId']);

        $form = $this->formFactory->create(ArgumentType::class, $argument);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw new UserError('Invalid data.');
        }

        $argument->setValidated(false);
        $argument->resetVotes();

        $this->em->flush();

        $this->publisher->publish(CapcoAppBundleMessagesTypes::ARGUMENT_UPDATE, new Message(
            json_encode([
                'argumentId' => $argument->getId(),
            ])
        ));

        return ['argument' => $argument];
    }
}
