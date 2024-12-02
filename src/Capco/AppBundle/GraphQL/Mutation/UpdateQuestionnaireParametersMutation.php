<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Form\QuestionnaireParametersUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateQuestionnaireParametersMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly QuestionnaireRepository $questionnaireRepository, private readonly LoggerInterface $logger, private readonly GlobalIdResolver $globalIdResolver, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        $questionnaireId = GlobalId::fromGlobalId($arguments['questionnaireId'])['id'];
        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->questionnaireRepository->find($questionnaireId);

        if (!$questionnaire) {
            throw new UserError(sprintf('Unknown questionnaire with id "%s"', $questionnaireId));
        }
        unset($arguments['questionnaireId']);

        $form = $this->formFactory->create(
            QuestionnaireParametersUpdateType::class,
            $questionnaire
        );
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return ['questionnaire' => $questionnaire];
    }

    public function isGranted(string $id, User $viewer): bool
    {
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        if ($questionnaire instanceof Questionnaire) {
            return $this->authorizationChecker->isGranted(QuestionnaireVoter::EDIT, $questionnaire);
        }

        return false;
    }
}
