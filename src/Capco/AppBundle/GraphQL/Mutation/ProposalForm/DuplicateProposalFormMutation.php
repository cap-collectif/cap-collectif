<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class DuplicateProposalFormMutation extends AbstractProposalFormMutation
{
    use MutationTrait;

    private TranslatorInterface $translator;

    public function __construct(
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        TranslatorInterface $translator,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        parent::__construct($entityManager, $globalIdResolver, $authorizationChecker);
        $this->translator = $translator;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $id = $input->offsetGet('id');
            $proposalForm = $this->getProposalForm($id, $viewer);

            $clone = $this->cloneProposalForm($proposalForm);
            $this->resetTitle($proposalForm, $clone);
            $this->setOwner($clone, $viewer);

            $proposalFormEvaluationForm = $clone->getEvaluationForm() ?? null;
            $analysisConfigurationEvaluationForm = $clone->getAnalysisConfiguration() ? $clone->getAnalysisConfiguration()->getEvaluationForm() : null;

            if ($proposalFormEvaluationForm) {
                $this->updateEvaluationForm($proposalFormEvaluationForm);
            }

            if ($analysisConfigurationEvaluationForm) {
                $this->updateEvaluationForm($analysisConfigurationEvaluationForm);
            }

            $this->em->persist($clone);
            $this->em->flush();
        } catch (UserError $error) {
            return ['error' => $error->getMessage()];
        }

        return ['duplicatedProposalForm' => $clone];
    }

    /**
     * @TODO : Add a title as optional input.
     */
    private function resetTitle(ProposalForm $old, ProposalForm $clone): void
    {
        $clone->setTitle($this->translator->trans('copy-of') . ' ' . $old->getTitle());
        $clone->setSlug('copy-of' . $old->getSlug());
    }

    private function setOwner(ProposalForm $clone, User $viewer): void
    {
        $clone->setOwner($viewer);
    }

    private function cloneProposalForm(ProposalForm $model): ProposalForm
    {
        //proposalForm:__clone is overridden and will do all the job
        return clone $model;
    }

    private function updateEvaluationForm(Questionnaire $evaluationForm): void
    {
        $evaluationForm->setSlug('copy-of-' . $evaluationForm->getSlug());
        $evaluationForm->setTitle($this->translator->trans('copy-of') . ' ' . $evaluationForm->getTitle());
    }
}
