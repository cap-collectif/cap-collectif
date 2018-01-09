<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFusionType;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactory;

class UpdateProposalFusionMutation
{
    private $em;
    private $formFactory;
    private $proposalRepo;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, ProposalRepository $proposalRepo)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->proposalRepo = $proposalRepo;
    }

    public function __invoke(Argument $input)
    {
        $proposalIds = $input->getRawArguments()['fromProposals'];

        if (count($proposalIds) < 2) {
            throw new UserError('You must specify at least 2 proposals to merge.');
        }

        $proposal = $this->proposalRepo->find($input->getRawArguments()['proposalId']);

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

        $form = $this->formFactory->create(ProposalFusionType::class, $proposal, ['proposalForm' => $proposalForm]);
        $form->submit(['childConnections' => $proposalIds], false);

        if (!$form->isValid()) {
            throw new UserError('Invalid data.');
        }

        $this->em->flush();

        return ['proposal' => $proposal];
    }
}
