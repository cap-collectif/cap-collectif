<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ProposalFusionType;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactory;

class UpdateProposalFusionMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $proposalRepo;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        ProposalRepository $proposalRepo
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->proposalRepo = $proposalRepo;
    }

    public function __invoke(Argument $input): array
    {
        $proposalIds = $input->getRawArguments()['fromProposals'];
        $proposalId = $input->getRawArguments()['proposalId'];

        $proposal = $this->proposalRepo->find($proposalId);
        if (!$proposal) {
            throw new UserError('Unknown proposal to merge with id: ' . $proposalId);
        }

        $beforeChildProposalIds = $proposal->getChildConnections()->map(function ($entity) {
            return $entity->getId();
        });

        $proposalForm = $proposal->getProposalForm();
        foreach ($proposalIds as $key => $id) {
            $child = $this->proposalRepo->find($id);
            if (!$child) {
                throw new UserError('Unknown proposal to merge with id: ' . $id);
            }
            if ($child->getProposalForm() !== $proposalForm) {
                throw new UserError('All proposals to merge should have the same proposalForm.');
            }
        }

        $form = $this->formFactory->create(ProposalFusionType::class, $proposal, [
            'proposalForm' => $proposalForm,
        ]);
        $form->submit(['childConnections' => $proposalIds], false);

        if (!$form->isValid()) {
            throw new UserError('Invalid data.');
        }

        $this->em->flush();

        $afterChildProposalIds = $proposal->getChildConnections()->map(function ($entity) {
            return $entity->getId();
        });
        $removedMergedFromIds = $beforeChildProposalIds->filter(function ($id) use (
            $afterChildProposalIds
        ) {
            return !$afterChildProposalIds->contains($id);
        });
        $removedMergedFrom = [];
        foreach ($removedMergedFromIds as $id) {
            $removedMergedFrom[] = $this->proposalRepo->find($id);
        }

        return ['proposal' => $proposal, 'removedMergedFrom' => $removedMergedFrom];
    }
}
