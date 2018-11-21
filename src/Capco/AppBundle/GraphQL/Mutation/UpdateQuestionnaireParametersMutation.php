<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\QuestionnaireParametersUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactory;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class UpdateQuestionnaireParametersMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $questionnaireRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        QuestionnaireRepository $questionnaireRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->questionnaireRepository = $questionnaireRepository;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();

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
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return ['questionnaire' => $questionnaire];
    }
}
