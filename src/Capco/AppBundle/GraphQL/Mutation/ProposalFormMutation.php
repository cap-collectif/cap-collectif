<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ProposalFormMutation
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly ProposalFormRepository $proposalFormRepository;
    private readonly QuestionnaireRepository $questionnaireRepository;

    public function __construct(
        EntityManagerInterface $em,
        ProposalFormRepository $proposalFormRepository,
        QuestionnaireRepository $questionnaireRepository
    ) {
        $this->em = $em;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->questionnaireRepository = $questionnaireRepository;
    }

    public function setEvaluationForm(Argument $input): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $proposalForm = $this->proposalFormRepository->find($arguments['proposalFormId']);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%d"', $arguments['proposalFormId']));
        }

        $evaluationForm = $this->questionnaireRepository->find(
            GlobalId::fromGlobalId($arguments['evaluationFormId'])['id']
        );

        $proposalForm->setEvaluationForm($evaluationForm);

        $this->em->flush();

        return ['proposalForm' => $proposalForm];
    }
}
