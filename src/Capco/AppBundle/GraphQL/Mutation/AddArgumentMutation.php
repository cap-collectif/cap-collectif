<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Form\ArgumentType;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Maximal\Emoji\Detector;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class AddArgumentMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private OpinionRepository $opinionRepo;
    private OpinionVersionRepository $versionRepo;
    private FormFactoryInterface $formFactory;
    private RedisStorageHelper $redisStorage;
    private Publisher $publisher;
    private ArgumentRepository $argumentRepo;
    private LoggerInterface $logger;
    private StepRequirementsResolver $stepRequirementsResolver;

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
        $argumentableId = GlobalId::fromGlobalId($input->offsetGet('argumentableId'))['id'];
        $argumentable = $this->versionRepo->find($argumentableId);

        if (!$argumentable) {
            /** @var Opinion $argumentable */
            $argumentable = $this->opinionRepo->find($argumentableId);
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
            $step
            && !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($author, $step)
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

        $argument->setBody($this->removeEmojis($argument->getBody()));

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

    private function removeEmojis(string $body): string
    {
        if (!Detector::containsEmoji($body)) {
            return $body;
        }

        return Detector::removeEmoji($body);
    }
}
