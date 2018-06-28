<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Form\ArgumentType;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactory;

class AddArgumentMutation
{
    private $em;
    private $opinionRepo;
    private $versionRepo;
    private $formFactory;
    private $redisStorage;
    private $publisher;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, OpinionRepository $opinionRepo, OpinionVersionRepository $versionRepo, RedisStorageHelper $redisStorage, Publisher $publisher)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->opinionRepo = $opinionRepo;
        $this->versionRepo = $versionRepo;
        $this->redisStorage = $redisStorage;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, User $author): array
    {
        $argumentableId = $input->offsetGet('argumentableId');
        $argumentable = $this->opinionRepo->find($argumentableId);

        if (!$argumentable) {
            $argumentable = $this->versionRepo->find($argumentableId);
        }

        if (!$argumentable || !$argumentable instanceof Argumentable) {
            throw new UserError('Unknown argumentable with id: ' . $argumentableId);
        }

        if (!$argumentable->canContribute()) {
            throw new UserError("Can't add an argument to an uncontributable argumentable.");
        }

        if (0 === $argumentable->getOpinionType()->getCommentSystem()) {
            throw new UserError("Can't add argument to this opinion type.");
        }

        $argument = (new Argument())
            ->setAuthor($author)
        ;
        if ($argumentable instanceof Opinion) {
            $argument->setOpinion($argumentable);
        }
        if ($argumentable instanceof OpinionVersion) {
            $argument->setOpinionVersion($argumentable);
        }

        $values = $input->getRawArguments();
        unset($values['argumentableId']);
        $form = $this->formFactory->create(ArgumentType::class, $argument);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        // Should not be sync ?
        $argumentable->increaseArgumentsCount();

        $this->em->persist($argument);
        $this->em->flush();

        $this->redisStorage->recomputeUserCounters($author);
        $this->publisher->publish(CapcoAppBundleMessagesTypes::ARGUMENT_CREATE, new Message(
          json_encode([
              'argumentId' => $argument->getId(),
          ])
        ));

        return ['argument' => $argument];
    }
}
