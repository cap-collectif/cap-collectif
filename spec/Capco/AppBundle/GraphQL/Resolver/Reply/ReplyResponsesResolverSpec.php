<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyResponsesResolver;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class ReplyResponsesResolverSpec extends ObjectBehavior
{
    public function let(LoggerInterface $logger,
                        AbstractQuestionRepository $abstractQuestionRepository,
                        AbstractResponseRepository $abstractResponseRepository)
    {
        $this->beConstructedWith($logger, $abstractQuestionRepository, $abstractResponseRepository);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ReplyResponsesResolver::class);
    }

    public function it_should_return_all_responses_when_acl_are_disabled(
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository,
        Questionnaire $questionnaire,
        Reply $reply,
        User $author,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void
    {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => true]);
        $question->isPrivate()->willReturn(true);
        $question->getId()->willReturn('question1');
        $response->getQuestion()->willReturn($question);
        $questions = new ArrayCollection([$question->getWrappedObject()]);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $reply->getAuthor()->willReturn($author);
        $abstractResponseRepository->getByReply($reply, true)->willReturn($responses->toArray());
        $abstractQuestionRepository->findByQuestionnaire($reply->getWrappedObject()->getQuestionnaire())->willReturn($questions->toArray());
        $this->__invoke($reply, $viewer, $context)->shouldBeLike($responses->getIterator());
    }

    public function it_should_return_all_responses_when_viewer_is_author(
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository,
        Reply $reply,
        User $author,
        Questionnaire $questionnaire,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void
    {
        $viewer = $author;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $question->getId()->willReturn('question1');
        $response->getQuestion()->willReturn($question);
        $questions = new ArrayCollection([$question->getWrappedObject()]);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $questionnaire->isPrivateResult()->willReturn(false);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $reply->getAuthor()->willReturn($author);
        $abstractResponseRepository->getByReply($reply, true)->willReturn($responses->toArray());
        $abstractQuestionRepository->findByQuestionnaire($reply->getWrappedObject()->getQuestionnaire())->willReturn($questions->toArray());
        $this->__invoke($reply, $viewer, $context)->shouldBeLike($responses->getIterator());
    }

    public function it_should_not_return_private_responses_when_viewer_is_anonymous(
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository,
        Reply $reply,
        User $author,
        Questionnaire $questionnaire,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void
    {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $question->getId()->willReturn('question1');
        $response->getQuestion()->willReturn($question);
        $questions = new ArrayCollection([$question->getWrappedObject()]);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $questionnaire->isPrivateResult()->willReturn(false);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $reply->getAuthor()->willReturn($author);
        $abstractResponseRepository->getByReply($reply, true)->willReturn($responses->toArray());
        $abstractQuestionRepository->findByQuestionnaire($reply->getWrappedObject()->getQuestionnaire())->willReturn($questions->toArray());
        $this->__invoke($reply, $viewer, $context)->shouldBeLike(
            (new ArrayCollection([]))->getIterator()
        );
    }

    public function it_should_not_return_private_responses_when_viewer_is_not_author(
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository,
        Reply $reply,
        User $author,
        User $viewer,
        Questionnaire $questionnaire,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void
    {
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $question->getId()->willReturn('question1');
        $response->getQuestion()->willReturn($question);
        $questions = new ArrayCollection([$question->getWrappedObject()]);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $viewer->isAdmin()->willReturn(false);
        $questionnaire->isPrivateResult()->willReturn(false);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $reply->getAuthor()->willReturn($author);
        $abstractResponseRepository->getByReply($reply, true)->willReturn($responses->toArray());
        $abstractQuestionRepository->findByQuestionnaire($reply->getWrappedObject()->getQuestionnaire())->willReturn($questions->toArray());
        $this->__invoke($reply, $viewer, $context)->shouldBeLike(
            (new ArrayCollection([]))->getIterator()
        );
    }
}
