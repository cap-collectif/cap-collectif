<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Form\ParticipantType;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Mutation\UpdateParticipantRequirementMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateMediatorVotesMutation extends MediatorVotesMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $entityManager;
    private GlobalIdResolver $globalIdResolver;
    private ProposalVoteAccountHandler $proposalVoteAccountHandler;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private FormFactoryInterface $formFactory;
    private UpdateParticipantRequirementMutation $updateParticipantRequirementMutation;

    public function __construct(
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        ProposalVoteAccountHandler $proposalVoteAccountHandler,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        Manager $manager,
        FormFactoryInterface $formFactory,
        UpdateParticipantRequirementMutation $updateParticipantRequirementMutation
    ) {
        parent::__construct($globalIdResolver, $manager, $updateParticipantRequirementMutation);

        $this->entityManager = $entityManager;
        $this->globalIdResolver = $globalIdResolver;
        $this->proposalVoteAccountHandler = $proposalVoteAccountHandler;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $argument, User $viewer): array
    {
        $this->formatInput($argument);
        $mediatorId = $argument->offsetGet('mediatorId');
        $participantId = $argument->offsetGet('participantId');
        $proposalsId = $argument->offsetGet('proposals');
        $participantInfos = $argument->offsetGet('participantInfos');

        /** * @var Mediator $mediator  */
        $mediator = $this->getEntityByGlobalId($mediatorId, $viewer, Mediator::class);

        /** * @var Participant $participant  */
        $participant = $this->getEntityByGlobalId($participantId, $viewer, Participant::class);

        $checkboxes = $participantInfos['checkboxes'] ?? null;
        unset($participantInfos['checkboxes']);
        if ($checkboxes) {
            $this->handleCheckboxes($participant, $checkboxes);
        }

        $step = $mediator->getStep();

        $currentVotes = $this->proposalSelectionVoteRepository->findBy([
            'mediator' => $mediator,
            'participant' => $participant,
        ]);

        $this->removeOldVotes($currentVotes, $proposalsId);
        $this->addNewVotes($currentVotes, $proposalsId, $viewer, $mediator, $step, $participant);
        $this->updateParticipantInfos($participant, $participantInfos);
        $this->updateAccountedVotes($step, $mediator, $participant, $viewer);

        $this->entityManager->flush();

        return ['mediator' => $mediator, 'participant' => $participant];
    }

    public function updateParticipantInfos(Participant $participant, $participantInfos): void
    {
        $form = $this->formFactory->create(ParticipantType::class, $participant);
        $form->submit($participantInfos, false);
        if (!$form->isValid()) {
            throw new UserError('Participant infos invalid');
        }
        $this->entityManager->flush();
    }

    private function getEntityByGlobalId(string $id, ?User $viewer, string $entityClass): object
    {
        $entity = $this->globalIdResolver->resolve($id, $viewer);

        if (!$entity instanceof $entityClass) {
            throw new \RuntimeException("{$entityClass} not found for id: {$id}");
        }

        return $entity;
    }

    private function addVote(Proposal $proposal, Mediator $mediator, ?AbstractStep $step, Participant $participant): void
    {
        $proposalSelectionVote = (new ProposalSelectionVote())
            ->setProposal($proposal)
            ->setMediator($mediator)
            ->setSelectionStep($step)
        ;

        $proposalSelectionVote->setParticipant($participant);

        $this->entityManager->persist($proposalSelectionVote);
        $this->entityManager->flush();
    }

    private function updateAccountedVotes(?AbstractStep $step, Mediator $mediator, Participant $participant, User $viewer): void
    {
        $this->proposalVoteAccountHandler->checkIfMediatorParticipantVotesAreStillAccounted(
            $step,
            $mediator,
            $participant,
            $viewer
        );
    }

    private function removeOldVotes(array $currentVotes, $updatedProposalsId): void
    {
        /** * @var ProposalSelectionVote $vote */
        foreach ($currentVotes as $vote) {
            $currentVoteProposalId = GlobalId::toGlobalId('Proposal', $vote->getProposal()->getId());
            $isOldVote = !\in_array($currentVoteProposalId, $updatedProposalsId);
            if (!$isOldVote) {
                continue;
            }
            $this->entityManager->remove($vote);
        }
        $this->entityManager->flush();
    }

    private function addNewVotes(
        array $currentVotes,
        array $updatedProposalsId,
        ?User $viewer,
        Mediator $mediator,
        ?AbstractStep $step,
        Participant $participant
    ) {
        $currentProposalsId = array_map(function ($vote) {
            return GlobalId::toGlobalId('Proposal', $vote->getProposal()->getId());
        }, $currentVotes);

        foreach ($updatedProposalsId as $updatedProposalId) {
            $isNewVote = !\in_array($updatedProposalId, $currentProposalsId);
            if (!$isNewVote) {
                continue;
            }
            $proposal = $this->getEntityByGlobalId($updatedProposalId, $viewer, Proposal::class);
            $this->addVote($proposal, $mediator, $step, $participant);
        }
    }
}
