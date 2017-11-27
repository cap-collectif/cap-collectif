<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Form\ProposalEvaluationType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalEvaluationMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function changeProposalEvaluation(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $om = $this->container->get('doctrine.orm.default_entity_manager');

        $formFactory = $this->container->get('form.factory');

        /** @var Proposal $proposal */
        $proposal = $this->container->get('capco.proposal.repository')->find($arguments['proposalId']);

        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%d"', $arguments['proposalId']));
        }

        unset($arguments['proposalId']);
        $proposalEvaluation = $this->container->get('capco.proposal_evaluation.repository')->findOneBy([
            'proposal' => $proposal,
        ]);

        if (!$proposalEvaluation) {
            $proposalEvaluation = new ProposalEvaluation();
            $proposalEvaluation->setProposal($proposal);
        }

        $arguments['responses'] = array_values(array_map(function ($response) {
            $decodeValue = json_decode($response['value']);

            return [
                'value' => $decodeValue ?? $response['value'],
                'question' => $response['question'],
                'type' => 'value_response',
            ];
        }, $arguments['responses']));

        $form = $formFactory->create(ProposalEvaluationType::class, $proposalEvaluation);

        $form->submit($arguments, false);

        if (!$form->isValid()) {
            throw new UserError('Form is not valid :' . (string) $form->getErrors(true, false));
        }

        $om->persist($proposalEvaluation);

        try {
            $om->flush();
        } catch (\Exception $e) {
            throw new UserError('Error during the flush :' . $e->getMessage());
        }

        return ['proposal' => $proposal];
    }
}
