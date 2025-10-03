<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\GraphQL\Mutation\ProposalForm\CreateProposalFormMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\UpdateProposalFormMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\UpdateProposalFormNotificationsConfiguration;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class PreConfigureProjectProposalFormPersister
{
    public function __construct(
        private readonly CreateProposalFormMutation $createProposalFormMutation,
        private readonly UpdateProposalFormMutation $updateProposalFormMutation,
        private readonly UpdateProposalFormNotificationsConfiguration $updateProposalFormNotificationsConfigurationMutation
    ) {
    }

    public function addProposalForm(array $proposalFormsInput, string $ownerId, User $viewer, bool $toLogUserAction = true): array
    {
        if (empty($proposalFormsInput)) {
            return [];
        }
        $proposalFormTitleToIdMap = [];

        foreach ($proposalFormsInput as $proposalFormInput) {
            $notifications = $proposalFormInput['notifications'] ?? null;
            unset($proposalFormInput['notifications']);

            ['proposalForm' => $proposalForm] = $this->createProposalFormMutation->__invoke(
                new Argument(['input' => ['title' => $proposalFormInput['title'], 'owner' => $ownerId]]),
                $viewer,
                $toLogUserAction
            );

            unset($proposalFormInput['title']);
            $proposalFormInput['proposalFormId'] = $proposalForm->getId();

            $this->updateProposalFormMutation->__invoke(
                new Argument(['input' => $proposalFormInput]),
                $viewer
            );

            if ($notifications) {
                $this->updateProposalFormNotificationsConfigurationMutation->__invoke(
                    new Argument([
                        'input' => [
                            ...$notifications,
                            'proposalFormId' => $proposalForm->getId(),
                        ],
                    ]),
                    $viewer
                );
            }

            $proposalFormTitleToIdMap[$proposalForm->getTitle()] = $proposalForm->getId();
        }

        return $proposalFormTitleToIdMap;
    }
}
