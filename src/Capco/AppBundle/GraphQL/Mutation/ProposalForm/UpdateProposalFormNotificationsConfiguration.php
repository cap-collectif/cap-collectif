<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Form\ProposalFormNotificationsConfigurationType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateProposalFormNotificationsConfiguration extends AbstractProposalFormMutation
{
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger
    ) {
        parent::__construct($entityManager, $globalIdResolver, $authorizationChecker);
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer)
    {
        $arguments = $input->getArrayCopy();
        $proposalForm = $this->getProposalForm($arguments['proposalFormId'], $viewer);

        unset($arguments['proposalFormId']);

        $form = $this->formFactory->create(
            ProposalFormNotificationsConfigurationType::class,
            $proposalForm->getNotificationsConfiguration()
        );

        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(
                static::class .
                    ' updateNotificationsConfiguration: ' .
                    (string) $form->getErrors(true, false)
            );

            throw new UserError('Can\'t change the notification config!');
        }

        $this->em->flush();

        return ['proposalForm' => $proposalForm];
    }
}
