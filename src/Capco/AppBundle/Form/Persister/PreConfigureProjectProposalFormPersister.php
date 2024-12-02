<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\GraphQL\Mutation\ProposalForm\CreateProposalFormMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\UpdateProposalFormMutation;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class PreConfigureProjectProposalFormPersister
{
    public function __construct(private readonly CreateProposalFormMutation $createProposalFormMutation, private readonly UpdateProposalFormMutation $updateProposalFormMutation)
    {
    }

    public function addProposalForm(array $proposalFormsInput, string $ownerId, User $viewer): array
    {
        if (empty($proposalFormsInput)) {
            return [];
        }
        $proposalFormTitleToIdMap = [];

        foreach ($proposalFormsInput as $proposalFormInput) {
            ['proposalForm' => $proposalForm] = $this->createProposalFormMutation->__invoke(
                new Argument(['input' => ['title' => $proposalFormInput['title'], 'owner' => $ownerId]]),
                $viewer
            );

            unset($proposalFormInput['title']);
            $proposalFormInput['proposalFormId'] = $proposalForm->getId();

            $this->updateProposalFormMutation->__invoke(
                new Argument(['input' => $proposalFormInput]),
                $viewer
            );

            $proposalFormTitleToIdMap[$proposalForm->getTitle()] = $proposalForm->getId();
        }

        return $proposalFormTitleToIdMap;
    }
}
