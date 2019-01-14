<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ProposalFusionType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactory;

class UpdateProposalFusionMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, $user): array
    {
        $proposalIds = $input->getRawArguments()['fromProposals'];
        $proposalId = $input->getRawArguments()['proposalId'];

        $proposal = $this->globalIdResolver->resolve($proposalId, $user);
        if (!$proposal) {
            throw new UserError("Unknown proposal to merge with id: ${proposalId}");
        }

        $beforeChildProposalIds = $proposal->getChildConnections()->map(function ($entity) {
            return $entity->getId();
        });

        $proposalForm = $proposal->getProposalForm();
        $proposalUuids = [];
        foreach ($proposalIds as $key => $id) {
            $child = $this->globalIdResolver->resolve($id, $user);
            if (!$child) {
                throw new UserError("Unknown proposal to merge with globalId: ${id}");
            }
            if ($child->getProposalForm() !== $proposalForm) {
                throw new UserError('All proposals to merge should have the same proposalForm.');
            }
            $proposalUuids[] = $child->getId();
        }

        $form = $this->formFactory->create(ProposalFusionType::class, $proposal, [
            'proposalForm' => $proposalForm,
        ]);
        $form->submit(['childConnections' => $proposalUuids], false);

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
            $removedMergedFrom[] = $this->globalIdResolver->resolve($id, $user);
        }

        return ['proposal' => $proposal, 'removedMergedFrom' => $removedMergedFrom];
    }
}
