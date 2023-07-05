<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Mutation\DeleteQuestionnaireMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\AnalysisConfigurationRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class DeleteQuestionnaireMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationChecker $authorizationChecker,
        AnalysisConfigurationRepository $analysisConfigurationRepository
    ) {
        $this->beConstructedWith(
            $em,
            $globalIdResolver,
            $analysisConfigurationRepository,
            $authorizationChecker
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteQuestionnaireMutation::class);
    }

    public function it_should_delete_post(
        Arg $arguments,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Questionnaire $questionnaire
    ) {
        $id = 'abc';
        $arguments->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);

        $em->remove(Argument::type(Questionnaire::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'deletedQuestionnaireId' => $id,
        ]);
    }

    public function it_should_set_proposal_form_evalutation_form_to_null_if_questionnaire_is_linked_to_the_form(
        Arg $arguments,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Questionnaire $questionnaire,
        ProposalForm $proposalForm
    ) {
        $id = 'abc';
        $arguments->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);

        $questionnaire->getProposalForm()->willReturn($proposalForm);
        $questionnaire->getStep()->shouldBeCalledOnce()->willReturn(null);
        $proposalForm->setEvaluationForm(null)->shouldBeCalled();

        $em->remove(Argument::type(Questionnaire::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'deletedQuestionnaireId' => $id,
        ]);
    }

    public function it_should_set_analysis_configuration_evalutation_form_to_null_if_questionnaire_is_linked_to_the_form(
        Arg $arguments,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Questionnaire $questionnaire,
        AnalysisConfigurationRepository $analysisConfigurationRepository,
        AnalysisConfiguration $analysisConfiguration
    ) {
        $id = 'abc';
        $arguments->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);

        $analysisConfigurationRepository
            ->findOneBy(['evaluationForm' => $questionnaire])
            ->willReturn($analysisConfiguration)
        ;
        $analysisConfiguration->setEvaluationForm(null)->shouldBeCalled();

        $em->remove(Argument::type(Questionnaire::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'deletedQuestionnaireId' => $id,
        ]);
    }

    public function it_should_not_grant_access_if_no_post_found(
        User $viewer,
        GlobalIdResolver $globalIdResolver
    ) {
        $postId = 'abc';
        $globalIdResolver->resolve($postId, $viewer)->willReturn(null);

        $this->isGranted($postId, $viewer)->shouldReturn(false);
    }

    public function it_should_call_voter_if_questionnaire_exist(
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        AuthorizationChecker $authorizationChecker
    ) {
        $postId = 'abc';
        $globalIdResolver->resolve($postId, $viewer)->willReturn($questionnaire);
        $authorizationChecker
            ->isGranted(QuestionnaireVoter::DELETE, $questionnaire)
            ->shouldBeCalled()
        ;

        $this->isGranted($postId, $viewer);
    }

    public function it_should_set_questionnaire_to_null_if_questionnaire_is_linked_to_a_step(
        Arg $arguments,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Questionnaire $questionnaire,
        ProposalForm $proposalForm,
        QuestionnaireStep $questionnaireStep
    ) {
        $id = 'abc';
        $arguments->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);

        $questionnaire->getProposalForm()->willReturn($proposalForm);
        $questionnaire->getStep()->shouldBeCalledOnce()->willReturn($questionnaireStep);
        $questionnaireStep->setQuestionnaire(null)->shouldBeCalledOnce();
        $proposalForm->setEvaluationForm(null)->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'deletedQuestionnaireId' => $id,
        ]);
    }
}
