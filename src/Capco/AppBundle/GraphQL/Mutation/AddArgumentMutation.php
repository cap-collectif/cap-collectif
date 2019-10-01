<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Swarrot\Broker\Message;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Form\ArgumentType;
use Capco\AppBundle\Model\Argumentable;
use Symfony\Component\Form\FormFactoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\OpinionVersion;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;

class AddArgumentMutation implements MutationInterface
{
    private $em;
    private $opinionRepo;
    private $versionRepo;
    private $formFactory;
    private $redisStorage;
    private $publisher;
    private $argumentRepo;
    private $logger;
    private $stepRequirementsResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        OpinionRepository $opinionRepo,
        OpinionVersionRepository $versionRepo,
        RedisStorageHelper $redisStorage,
        Publisher $publisher,
        ArgumentRepository $argumentRepo,
        LoggerInterface $logger,
        StepRequirementsResolver $stepRequirementsResolver
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->publisher = $publisher;
        $this->formFactory = $formFactory;
        $this->opinionRepo = $opinionRepo;
        $this->versionRepo = $versionRepo;
        $this->redisStorage = $redisStorage;
        $this->argumentRepo = $argumentRepo;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
    }

    public function __invoke(Arg $input, User $author): array
    {
        $argumentableId = $input->offsetGet('argumentableId');
        /** @var Opinion $argumentable */
        $argumentable = $this->opinionRepo->find($argumentableId);

        if (!$argumentable) {
            $argumentable = $this->versionRepo->find($argumentableId);
        }

        if (!$argumentable || !$argumentable instanceof Argumentable) {
            $this->logger->error('Unknown argumentable with id: ' . $argumentableId);
            $error = ['message' => 'Unknown argumentable.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        if (!$argumentable->canContribute($author)) {
            $this->logger->error(
                'Can\'t add an argument to an uncontribuable argumentable with id: ' .
                    $argumentableId
            );
            $error = ['message' => 'Can\'t add an argument to an uncontribuable argumentable.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        if (0 === $argumentable->getOpinionType()->getCommentSystem()) {
            $this->logger->error('Can\'t add argument to this opinion type.');
            $error = ['message' => "Can't add argument to this opinion type."];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        $step = $argumentable->getStep();

        if (
            $step &&
            !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($author, $step)
        ) {
            $this->logger->error('You dont meets all the requirements.');
            $error = ['message' => 'You dont meets all the requirements.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        if (\count($this->argumentRepo->findCreatedSinceIntervalByAuthor($author, 'PT1M')) >= 2) {
            $this->logger->error('You contributed too many times.');
            $error = ['message' => 'You contributed too many times.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        $argument = (new Argument())->setAuthor($author);
        if ($argumentable instanceof Opinion) {
            $argument->setOpinion($argumentable);
        }
        if ($argumentable instanceof OpinionVersion) {
            $argument->setOpinionVersion($argumentable);
        }

        $values = $input->getArrayCopy();
        unset($values['argumentableId']);
        $form = $this->formFactory->create(ArgumentType::class, $argument);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($argument);
        $this->em->flush();

        $this->redisStorage->recomputeUserCounters($author);
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::ARGUMENT_CREATE,
            new Message(json_encode(['argumentId' => $argument->getId()]))
        );

        $totalCount = 0;
        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $argument);

        return ['argument' => $argument, 'argumentEdge' => $edge, 'userErrors' => []];
    }
}
