<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mediator;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\MediatorParticipantStep;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Form\ParticipantType;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class AddMediatorVotesMutation extends MediatorVotesMutationAuthorization implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $entityManager;
    private GlobalIdResolver $globalIdResolver;
    private TokenGeneratorInterface $tokenGenerator;
    private ProposalVoteAccountHandler $proposalVoteAccountHandler;
    private Publisher $publisher;
    private FormFactoryInterface $formFactory;

    public function __construct(
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        TokenGeneratorInterface $tokenGenerator,
        ProposalVoteAccountHandler $proposalVoteAccountHandler,
        Publisher $publisher,
        Manager $manager,
        FormFactoryInterface $formFactory
    ) {
        parent::__construct($globalIdResolver, $manager);

        $this->entityManager = $entityManager;
        $this->globalIdResolver = $globalIdResolver;
        $this->tokenGenerator = $tokenGenerator;
        $this->proposalVoteAccountHandler = $proposalVoteAccountHandler;
        $this->publisher = $publisher;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $argument, User $viewer): array
    {
        $this->formatInput($argument);
        $mediatorId = $argument->offsetGet('mediatorId');
        $stepId = $argument->offsetGet('stepId');
        $proposals = $argument->offsetGet('proposals');
        $participantInfos = $argument->offsetGet('participantInfos');

        /** @var Mediator $mediator */
        $mediator = $this->getEntityByGlobalId($mediatorId, $viewer, Mediator::class);
        /** @var SelectionStep $step */
        $step = $this->getEntityByGlobalId($stepId, $viewer, SelectionStep::class);

        $participant = $this->getParticipant($participantInfos);

        $mediatorParticipantStep = (new MediatorParticipantStep())->setStep($step)->setParticipant($participant)->setMediator($mediator);
        $this->entityManager->persist($mediatorParticipantStep);

        foreach ($proposals as $proposalId) {
            $proposal = $this->getEntityByGlobalId($proposalId, $viewer, Proposal::class);

            $proposalSelectionVote = (new ProposalSelectionVote())
                ->setProposal($proposal)
                ->setSelectionStep($step)
                ->setMediator($mediator)
            ;

            $proposalSelectionVote->setParticipant($participant);

            $this->entityManager->persist($participant);
            $this->entityManager->persist($proposalSelectionVote);
            $this->entityManager->flush();

            $this->proposalVoteAccountHandler->checkIfMediatorParticipantVotesAreStillAccounted(
                $step,
                $mediator,
                $participant,
                $viewer
            );
        }

        $this->entityManager->flush();

        $cleanParticipantInfos = array_filter($participantInfos);
        $canBeProcessed = (1 === \count($cleanParticipantInfos) && isset($cleanParticipantInfos['email']) && [] === $proposals);
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::MEDIATOR_NOTIFICATION_PUB_PARTICIPANT,
            new Message(json_encode([
                'participantId' => $participant->getId(),
                'mediatorId' => $mediator->getId(),
                'canBeProcessed' => $canBeProcessed,
            ]))
        );

        return ['mediator' => $mediator, 'participant' => $participant];
    }

    private function getEntityByGlobalId(string $id, ?User $viewer, string $entityClass): object
    {
        $entity = $this->globalIdResolver->resolve($id, $viewer);

        if (!$entity instanceof $entityClass) {
            throw new \RuntimeException("{$entityClass} not found for id: {$id}");
        }

        return $entity;
    }

    private function getParticipant(array $participantInfos): Participant
    {
        $participant = new Participant();
        $participantInfos['token'] = $this->tokenGenerator->generateToken();
        $form = $this->formFactory->create(ParticipantType::class, $participant);
        $form->submit($participantInfos, false);

        if (!$form->isValid()) {
            throw new UserError('Participant infos invalid');
        }

        $this->entityManager->persist($participant);

        return $participant;
    }
}
