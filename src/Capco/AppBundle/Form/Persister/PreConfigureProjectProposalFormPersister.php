<?php
namespace Capco\AppBundle\Form\Persister;


use Capco\AppBundle\GraphQL\Mutation\ProposalForm\CreateProposalFormMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\UpdateProposalFormMutation;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class PreConfigureProjectProposalFormPersister {

    private CreateProposalFormMutation $createProposalFormMutation;
    private UpdateProposalFormMutation $updateProposalFormMutation;

    public function __construct(
        CreateProposalFormMutation $createProposalFormMutation,
        UpdateProposalFormMutation $updateProposalFormMutation
    )
    {

        $this->createProposalFormMutation = $createProposalFormMutation;
        $this->updateProposalFormMutation = $updateProposalFormMutation;
    }

    public function addProposalForm(array $proposalFormsInput, string $ownerId, User $viewer): array
    {
        if (empty($proposalFormsInput)) {
            return [];
        }
        $proposalFormTitleToIdMap = [];

        foreach ($proposalFormsInput as $proposalFormInput) {
            ['proposalForm' => $proposalForm] = $this->createProposalFormMutation->__invoke(
                new Argument(['title' => $proposalFormInput['title'], 'owner' => $ownerId]),
                $viewer
            );

            unset($proposalFormInput['title']);
            $proposalFormInput['proposalFormId'] = $proposalForm->getId();

             $this->updateProposalFormMutation->__invoke(
                new Argument($proposalFormInput),
                $viewer
            );

             $proposalFormTitleToIdMap[$proposalForm->getTitle()] = $proposalForm->getId();
        }

        return $proposalFormTitleToIdMap;
    }
}