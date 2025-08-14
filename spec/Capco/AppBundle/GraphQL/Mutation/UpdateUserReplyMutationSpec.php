<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateUserReplyMutation;
use Capco\AppBundle\GraphQL\Mutation\ValidatePhoneReusabilityMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class UpdateUserReplyMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        Publisher $publisher,
        GlobalIdResolver $globalIdResolver,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $responsesFormatter,
            $publisher,
            $globalIdResolver,
            $validatePhoneReusabilityMutation
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateUserReplyMutation::class);
    }

    public function it_should_published_a_draft(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Reply $reply,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        QuestionnaireStep $step,
        Publisher $publisher,
        Project $project,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        $values = [];
        $replyId = 'UmVwbHk6cmVwbHk1';
        $values['replyId'] = $replyId;
        $values['draft'] = false;
        $values['responses'] = [];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($values);
        $arguments->offsetGet('replyId')->willReturn($replyId);

        $globalIdResolver->resolve($replyId)->willReturn($reply);

        $viewer
            ->isEmailConfirmed()
            ->shouldBeCalled()
            ->willReturn(true)
        ;

        $validatePhoneReusabilityMutation->__invoke(Argument::type(Arg::class), $viewer)->willReturn(['errorCode' => null]);

        // https://github.com/phpspec/prophecy/issues/213#issuecomment-145499760
        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($viewer);
        $reply->getCompletionStatus()->willReturn(ContributionCompletionStatus::COMPLETED);
        $reply
            ->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))
            ->shouldBeCalled()
            ->willReturn($reply)
        ;

        $questionnaire->isNotifyResponseUpdate()->willReturn(false);
        $questionnaire->isAcknowledgeReplies()->willReturn(true);
        $questionnaire->isAnonymousAllowed()->willReturn(true);
        $step->getProject()->willReturn($project);
        $endDate = new \DateTime();
        $step->getEndAt()->willReturn($endDate);
        $step
            ->isOpen()
            ->shouldBeCalled()
            ->willReturn(true)
        ;

        $reply->getStep()->willReturn($step);
        $step->getRequirements()->willReturn(new ArrayCollection([]));
        $reply->getParticipant()->willReturn(null);

        $step->getSlug()->willReturn('questionnaire-step');
        $project->getId()->willReturn('projectQuestionnaireId');
        $project->getSlug()->willReturn('project1');
        $step->getProject()->willReturn($project);
        $stepUrlResolver->__invoke($step)->willReturn('google.com');

        $questionnaire->getStep()->willReturn($step);
        $questionnaire->isNotifyResponseUpdate()->willReturn(true);

        $responsesFormatter->format($values['responses'])->shouldBeCalled();

        $formFactory
            ->create(ReplyType::class, $reply, ['anonymousAllowed' => true])
            ->willReturn($form)
        ;
        $form->submit(['draft' => false, 'responses' => []], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $reply->getQuestionnaire()->willReturn($questionnaire);

        $publisher
            ->publish('questionnaire.reply', \Prophecy\Argument::type(Message::class))
            ->shouldBeCalled()
        ;
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldBe(['reply' => $reply]);
    }

    public function it_throw_userError_if_reply_is_not_found(
        EntityManagerInterface $em,
        Arg $arguments,
        User $viewer,
        GlobalIdResolver $globalIdResolver
    ) {
        $values = [];
        $replyId = 'UmVwbHkscmVwbHkxMA==';
        $values['replyId'] = $replyId;
        $values['draft'] = false;
        $values['responses'] = [];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($values);
        $arguments->offsetGet('replyId')->willReturn($replyId);

        $globalIdResolver->resolve($replyId)->willReturn(null);
        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(new UserError('Reply not found.'))->during('__invoke', [
            $arguments,
            $viewer,
        ]);
    }

    public function it_throw_userError_if_viewer_is_not_author_of_reply(
        EntityManagerInterface $em,
        Arg $arguments,
        User $viewer,
        User $author,
        Reply $reply,
        GlobalIdResolver $globalIdResolver
    ) {
        $values = [];
        $replyId = 'UmVwbHk6cmVwbHk1';
        $values['replyId'] = $replyId;
        $values['draft'] = false;
        $values['responses'] = [];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($values);
        $arguments->offsetGet('replyId')->willReturn($replyId);

        $viewer->getId()->willReturn('user1');
        $author->getId()->willReturn('user2');

        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($author);

        $globalIdResolver->resolve($replyId)->willReturn($reply);
        $reply->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->willReturn($reply);
        $em->flush()->shouldNotBeCalled();
        $this->shouldThrow(
            new UserError('You are not allowed to update this reply.')
        )->during('__invoke', [$arguments, $viewer]);
    }

    public function it_throw_GraphQLException_if_form_is_not_valid(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        FormInterface $form,
        Reply $reply,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        QuestionnaireStep $step,
        Project $project,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        $values = [];
        $replyId = 'UmVwbHk6cmVwbHk1';
        $values['replyId'] = $replyId;
        $values['draft'] = false;
        $values['responses'] = [];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($values);
        $arguments->offsetGet('replyId')->willReturn($replyId);

        $validatePhoneReusabilityMutation->__invoke(Argument::type(Arg::class), $viewer)->willReturn(['errorCode' => null]);

        $viewer->getId()->willReturn('user1');

        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($viewer);
        $reply->getQuestionnaire()->willReturn($questionnaire);

        $globalIdResolver->resolve($replyId)->willReturn($reply);
        $questionnaire->isNotifyResponseUpdate()->willReturn(false);
        $questionnaire->isAcknowledgeReplies()->willReturn(true);
        $questionnaire->isAnonymousAllowed()->willReturn(true);
        $step->getProject()->willReturn($project);
        $endDate = new \DateTime();
        $step->getEndAt()->willReturn($endDate);
        $step->getSlug()->willReturn('questionnaire-step');
        $project->getId()->willReturn('projectQuestionnaireId');
        $project->getSlug()->willReturn('project1');
        $step->getProject()->willReturn($project);
        $stepUrlResolver->__invoke($step)->willReturn('google.com');
        $reply->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->willReturn($reply);

        $questionnaire->getStep()->willReturn($step);

        $responsesFormatter->format($values['responses'])->shouldBeCalled();

        $formFactory
            ->create(ReplyType::class, $reply, ['anonymousAllowed' => true])
            ->willReturn($form)
        ;
        $form->submit(['draft' => false, 'responses' => []], false)->willReturn(null);
        $form->isValid()->willReturn(false);
        $form->getErrors()->willReturn([]);
        $form->all()->willReturn([]);

        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(GraphQLException::class)->during('__invoke', [$arguments, $viewer]);
    }
}
