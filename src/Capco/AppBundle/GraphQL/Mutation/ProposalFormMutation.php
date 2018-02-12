<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFormCreateType;
use Capco\AppBundle\Form\ProposalFormNotificationsConfigurationType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function create(Argument $input): array
    {
        $formFactory = $this->container->get('form.factory');
        $proposalForm = new ProposalForm();

        $form = $formFactory->create(ProposalFormCreateType::class, $proposalForm);

        $form->submit($input->getRawArguments(), false);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $em->persist($proposalForm);
        $em->flush();

        return ['proposalForm' => $proposalForm];
    }

    public function updateNotificationsConfiguration(Argument $input)
    {
        $arguments = $input->getRawArguments();
        $proposalForm = $this->container->get('capco.proposal_form.repository')->find($arguments['proposalFormId']);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%d"', $arguments['proposalFormId']));
        }

        $formFactory = $this->container->get('form.factory');
        $logger = $this->container->get('logger');
        unset($arguments['proposalFormId']);

        $form = $formFactory->create(ProposalFormNotificationsConfigurationType::class, $proposalForm->getNotificationsConfiguration());

        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $logger->error(\get_class($this) . ' updateNotificationsConfiguration: ' . (string) $form->getErrors(true, false));
            throw new UserError('Can\'t change the notification config!');
        }

        $this->container->get('doctrine.orm.default_entity_manager')->flush();

        return ['proposalForm' => $proposalForm];
    }

    public function setEvaluationForm(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $proposalForm = $this->container->get('capco.proposal_form.repository')->find($arguments['proposalFormId']);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%d"', $arguments['proposalFormId']));
        }

        $evaluationForm = $this->container->get('capco.questionnaire.repository')->find($arguments['evaluationFormId']);

        $proposalForm->setEvaluationForm($evaluationForm);

        $this->container->get('doctrine.orm.default_entity_manager')->flush();

        return [
            'proposalForm' => $proposalForm,
        ];
    }
}
