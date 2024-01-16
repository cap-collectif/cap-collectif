<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\QuestionnaireNotificationConfigurationType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateQuestionnaireNotificationConfiguration implements MutationInterface
{
    use MutationTrait;
    private GlobalIdResolver $globalIdResolver;
    private FormFactoryInterface $formFactory;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;
    private LoggerInterface $logger;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        LoggerInterface $logger
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->formFactory = $formFactory;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
    }

    public function __invoke(Argument $arguments, User $viewer): array
    {
        $this->formatInput($arguments);
        $data = $arguments->getArrayCopy();
        $questionnaireId = $arguments->offsetGet('questionnaireId');
        $questionnaire = $this->globalIdResolver->resolve($questionnaireId, $viewer);

        unset($data['questionnaireId']);

        $form = $this->formFactory->create(
            QuestionnaireNotificationConfigurationType::class,
            $questionnaire->getNotificationsConfiguration()
        );
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . $form->getErrors(true, false)->__toString());

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return ['questionnaire' => $questionnaire];
    }

    public function isGranted(string $id, User $viewer): bool
    {
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        if ($questionnaire) {
            return $this->authorizationChecker->isGranted(QuestionnaireVoter::EDIT, $questionnaire);
        }

        return false;
    }
}
