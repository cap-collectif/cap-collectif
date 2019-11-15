<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateReplyMutation;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Nette\Utils\DateTime;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;
use DG\BypassFinals;
use Symfony\Component\Form\FormInterface;

BypassFinals::enable();

class UpdateReplyMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver,
        Publisher $publisher,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $replyRepo,
            $responsesFormatter,
            $stepUrlResolver,
            $publisher,
            $questionnaireReplyNotifier
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateReplyMutation::class);
    }

    public function it_should_published_a_draft(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Reply $reply,
        ReplyRepository $replyRepo,
        Questionnaire $questionnaire,
        QuestionnaireStep $step,
        Publisher $publisher,
        Project $project,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier
    ) {
        $values = [];
        $values['replyId'] = 'UmVwbHk6cmVwbHk1';
        $values['draft'] = false;
        $values['responses'] = [];
        $arguments->getArrayCopy()->willReturn($values);

        $replyId = GlobalId::fromGlobalId($values['replyId'])['id'];
        $replyRepo->find($replyId)->willReturn($reply);

        // https://github.com/phpspec/prophecy/issues/213#issuecomment-145499760
        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($viewer);
        $reply->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->willReturn($reply);

        $questionnaire->isNotifyResponseUpdate()->willReturn(false);
        $questionnaire->isAcknowledgeReplies()->willReturn(true);
        $step->getProject()->willReturn($project);
        $endDate = new DateTime();
        $step->getEndAt()->willReturn($endDate);
        $step->getSlug()->willReturn('questionnaire-step');
        $project->getId()->willReturn('projectQuestionnaireId');
        $project->getSlug()->willReturn('project1');
        $step->getProject()->willReturn($project);
        $stepUrlResolver->__invoke($step)->willReturn('google.com');

        $questionnaire->getStep()->willReturn($step);
        $questionnaire->isNotifyResponseUpdate()->willReturn(true);

        $responsesFormatter->format($values['responses'])->shouldBeCalled();

        $formFactory->create(ReplyType::class, $reply, [])->willReturn($form);
        $form->submit(['draft' => false, 'responses' => []], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $reply->getQuestionnaire()->willReturn($questionnaire);

        $questionnaireReplyNotifier->onCreate($reply)->shouldBeCalled();

        $publisher
            ->publish('questionnaire.reply', \Prophecy\Argument::type(Message::class))
            ->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldBe(['reply' => $reply]);
    }

    public function it_throw_userError_if_reply_is_not_found(
        EntityManagerInterface $em,
        Arg $arguments,
        User $viewer,
        ReplyRepository $replyRepo
    ) {
        $values = [];
        $values['replyId'] = 'UmVwbHkscmVwbHkxMA==';
        $values['draft'] = false;
        $values['responses'] = [];
        $arguments->getArrayCopy()->willReturn($values);

        $replyId = GlobalId::fromGlobalId($values['replyId'])['id'];
        $replyRepo->find($replyId)->willReturn(null);
        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(new UserError('Reply not found.'))->during('__invoke', [
            $arguments,
            $viewer
        ]);
    }

    public function it_throw_userError_if_viewer_is_not_author_of_reply(
        EntityManagerInterface $em,
        Arg $arguments,
        User $viewer,
        User $author,
        Reply $reply,
        ReplyRepository $replyRepo
    ) {
        $values = [];
        $values['replyId'] = 'UmVwbHk6cmVwbHk1';
        $values['draft'] = false;
        $values['responses'] = [];
        $arguments->getArrayCopy()->willReturn($values);

        $viewer->getId()->willReturn('user1');
        $author->getId()->willReturn('user2');

        $replyId = GlobalId::fromGlobalId($values['replyId'])['id'];
        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($author);

        $replyRepo->find($replyId)->willReturn($reply);
        $reply->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->willReturn($reply);
        $em->flush()->shouldNotBeCalled();
        $this->shouldThrow(new UserError('You are not allowed to update this reply.'))->during(
            '__invoke',
            [$arguments, $viewer]
        );
    }

    public function it_throw_GraphQLException_if_form_is_not_valid(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        FormInterface $form,
        Reply $reply,
        ReplyRepository $replyRepo,
        Questionnaire $questionnaire,
        QuestionnaireStep $step,
        Project $project,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver
    ) {
        $values = [];
        $values['replyId'] = 'UmVwbHk6cmVwbHk1';
        $values['draft'] = false;
        $values['responses'] = [];
        $arguments->getArrayCopy()->willReturn($values);

        $viewer->getId()->willReturn('user1');

        $replyId = GlobalId::fromGlobalId($values['replyId'])['id'];
        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($viewer);

        $replyRepo->find($replyId)->willReturn($reply);
        $questionnaire->isNotifyResponseUpdate()->willReturn(false);
        $questionnaire->isAcknowledgeReplies()->willReturn(true);
        $step->getProject()->willReturn($project);
        $endDate = new DateTime();
        $step->getEndAt()->willReturn($endDate);
        $step->getSlug()->willReturn('questionnaire-step');
        $project->getId()->willReturn('projectQuestionnaireId');
        $project->getSlug()->willReturn('project1');
        $step->getProject()->willReturn($project);
        $stepUrlResolver->__invoke($step)->willReturn('google.com');
        $reply->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->willReturn($reply);

        $questionnaire->getStep()->willReturn($step);

        $responsesFormatter->format($values['responses'])->shouldBeCalled();

        $formFactory->create(ReplyType::class, $reply, [])->willReturn($form);
        $form->submit(['draft' => false, 'responses' => []], false)->willReturn(null);
        $form->isValid()->willReturn(false);
        $form->getErrors()->willReturn([]);
        $form->all()->willReturn([]);

        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(GraphQLException::class)->during('__invoke', [$arguments, $viewer]);
    }
}
