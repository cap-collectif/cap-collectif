<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\Form\ParticipantType;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Mutation\UpdateParticipantRequirementMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UpdateMediatorVotesMutation extends MediatorVotesMutation implements MutationInterface
{
    use MutationTrait;
    private readonly GlobalIdResolver $globalIdResolver;
    private readonly UpdateParticipantRequirementMutation $updateParticipantRequirementMutation;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        Manager $manager,
        private readonly FormFactoryInterface $formFactory,
        UpdateParticipantRequirementMutation $updateParticipantRequirementMutation,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly TranslatorInterface $translator,
    ) {
        parent::__construct($globalIdResolver, $manager, $proposalSelectionVoteRepository, $proposalCollectVoteRepository, $updateParticipantRequirementMutation, $this->entityManager);
        $this->globalIdResolver = $globalIdResolver;
    }

    /**
     * @throws ContributorAlreadyUsedPhoneException
     */
    public function __invoke(Argument $argument, User $viewer): array
    {
        $this->formatInput($argument);
        $mediatorId = $argument->offsetGet('mediatorId');
        $participantId = $argument->offsetGet('participantId');
        $proposalsId = $argument->offsetGet('proposals');
        $participantInfos = $argument->offsetGet('participantInfos');

        /** * @var Mediator $mediator */
        $mediator = $this->globalIdResolver->resolve($mediatorId, $viewer);

        $participant = $this->globalIdResolver->resolve($participantId, $viewer);

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

        if ($participantInfos['phone'] ?? null) {
            try {
                $this->canReusePhone($step, $participant, $participantInfos['phone']);
                $participant->setPhoneConfirmed(true);
            } catch (ContributorAlreadyUsedPhoneException) {
                $this->entityManager->remove($participant);
                $this->entityManager->flush();

                return [
                    'errors' => [
                        ['field' => 'phone', 'message' => $this->translator->trans('PHONE_ALREADY_USED_BY_ANOTHER_USER')],
                    ],
                ];
            }
        }

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

    private function addVote(
        Proposal $proposal,
        Mediator $mediator,
        ?AbstractStep $step,
        Participant $participant
    ): void {
        $proposalSelectionVote = (new ProposalSelectionVote())
            ->setProposal($proposal)
            ->setMediator($mediator)
            ->setSelectionStep($step)
        ;

        $proposalSelectionVote->setParticipant($participant);

        $this->entityManager->persist($proposalSelectionVote);
        $this->entityManager->flush();
    }

    private function updateAccountedVotes(
        ?AbstractStep $step,
        Mediator $mediator,
        Participant $participant,
        User $viewer
    ): void {
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
    ): void {
        $currentProposalsId = array_map(
            fn ($vote) => GlobalId::toGlobalId('Proposal', $vote->getProposal()->getId()),
            $currentVotes
        );

        foreach ($updatedProposalsId as $updatedProposalId) {
            $isNewVote = !\in_array($updatedProposalId, $currentProposalsId);
            if (!$isNewVote) {
                continue;
            }
            $proposal = $this->globalIdResolver->resolve($updatedProposalId, $viewer);
            $this->addVote($proposal, $mediator, $step, $participant);
        }
    }
}
