<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Mutation\UpdateReplyMutation;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\ReplyInterface;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Nette\Utils\DateTime;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateReplyMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter,
        ReplyInterface $userNotifier,
        StepUrlResolver $stepUrlResolver,
        Publisher $publisher
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $replyRepo,
            $redisStorageHelper,
            $responsesFormatter,
            $userNotifier,
            $stepUrlResolver,
            $publisher
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
        ReplyInterface $userNotifier,
        Publisher $publisher,
        Project $project,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver
    ) {
        $values = [];
        $values['replyId'] = 'UmVwbHk6cmVwbHk1';
        $values['draft'] = false;
        $values['responses'] = [];
        $arguments->getRawArguments()->willReturn($values);

        $replyId = GlobalId::fromGlobalId($values['replyId'])['id'];
        $replyRepo->find($replyId)->willReturn($reply);

        // https://github.com/phpspec/prophecy/issues/213#issuecomment-145499760
        $reply->isDraft()->willReturn(true, false);
        $reply->getId()->willReturn('reply5');
        $reply->getAuthor()->willReturn($viewer);

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

        $responsesFormatter->format($values['responses'])->shouldBeCalled();

        $formFactory->create(ReplyType::class, $reply, [])->willReturn($form);
        $form->submit(['draft' => false, 'responses' => []], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $reply->getQuestionnaire()->willReturn($questionnaire);

        $userNotifier
            ->acknowledgeReply($project, $reply, $endDate, 'google.com', $step, $viewer, false)
            ->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $publisher
            ->publish('questionnaire.reply', \Prophecy\Argument::type(Message::class))
            ->shouldNotBeCalled();

        $redisStorageHelper->recomputeUserCounters($viewer)->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldBe(['reply' => $reply]);
    }
}
