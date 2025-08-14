<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class ReplyReconcilierTest extends TestCase
{
    private ReplyReconcilier $replyReconcilier;
    private Participant $participant;
    private User $viewer;

    private Questionnaire $questionnaire;

    private QuestionnaireStep $questionnaireStep;

    private ReplyRepository $replyRepository;

    private EntityManagerInterface $em;

    private QuestionnaireRepository $questionnaireRepository;

    protected function setUp(): void
    {
        $this->replyRepository = $this->createMock(ReplyRepository::class);
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->questionnaireRepository = $this->createMock(QuestionnaireRepository::class);

        $this->replyReconcilier = new ReplyReconcilier(
            $this->em,
            $this->replyRepository,
            $this->questionnaireRepository
        );

        $this->participant = $this->createMock(Participant::class);
        $this->viewer = $this->createMock(User::class);
        $this->questionnaire = $this->createMock(Questionnaire::class);
        $this->questionnaireStep = $this->createMock(QuestionnaireStep::class);
    }

    public function setUpQuestionnaire(): void
    {
        $this->questionnaireRepository->expects($this->once())->method('getWithRepliesByParticipant')->willReturn([$this->questionnaire]);

        $this->questionnaire->expects($this->once())->method('getStep')->willReturn($this->questionnaireStep);
    }

    public function setUpRequirement(bool $isSameEmail = true): void
    {
        $emailRequirement = $this->createMock(Requirement::class);
        $emailRequirement->method('getType')->willReturn(Requirement::EMAIL_VERIFIED);

        $requirements = new ArrayCollection([$emailRequirement]);
        $this->questionnaireStep->method('getRequirements')->willReturn($requirements);

        $participantEmail = $isSameEmail ? 'toto@capco.com' : 'zozo@capco.com';
        $this->participant->method('getEmail')->willReturn($participantEmail);
        $this->viewer->method('getEmail')->willReturn('toto@capco.com');

        $this->participant->method('isEmailConfirmed')->willReturn(true);
        $this->viewer->method('isEmailConfirmed')->willReturn(true);
    }

    public function testShouldNotReconcileWhenStepIsClosed(): void
    {
        $this->disableCompletionStatusFilter();

        $reply = $this->createMock(Reply::class);
        $reply->method('getCompletionStatus')->willReturn(ContributionCompletionStatus::MISSING_REQUIREMENTS);
        $this->setUpQuestionnaire();

        $this->setUpRequirement();

        $this->replyRepository->method('findBy')
            ->with(['questionnaire' => $this->questionnaire, 'participant' => $this->participant])
            ->willReturn([$reply])
        ;

        $this->questionnaireStep->method('isClosed')->willReturn(true);

        $this->questionnaireStep->expects($this->never())->method('getRequirements');

        $this->replyReconcilier->reconcile($this->participant, $this->viewer);
    }

    public function testShouldNotReconcileWhenParticipantHasNotTheSameEmailAsViewer(): void
    {
        $this->disableCompletionStatusFilter();

        $this->setUpQuestionnaire();

        $this->questionnaireStep->method('isClosed')->willReturn(false);

        $this->setUpRequirement(false);

        $this->replyReconcilier->reconcile($this->participant, $this->viewer);

        $this->replyRepository->expects($this->never())->method('findBy')->with(['
            questionnaire' => $this->questionnaire,
            'participant' => $this->participant,
        ]);
    }

    public function testShouldNotReconcileWhenViewerAlreadyRepliedAndMultipleRepliesAreNotAllowed(): void
    {
        $this->disableCompletionStatusFilter();

        $reply = $this->createMock(Reply::class);
        $this->setUpQuestionnaire();

        $this->questionnaireStep->method('isClosed')->willReturn(false);

        $this->setUpRequirement();

        $this->replyRepository->method('findBy')->willReturnCallback(function ($criteria) use ($reply) {
            if (isset($criteria['participant']) && $criteria['participant'] === $this->participant) {
                return [$reply];
            }

            if ((isset($criteria['author']) && $criteria['author'] === $this->viewer)) {
                return [$reply];
            }

            return [];
        });

        $this->questionnaire->method('isMultipleRepliesAllowed')->willReturn(false);

        $this->replyReconcilier->reconcile($this->participant, $this->viewer);

        $reply->expects($this->never())->method('setContributor');
    }

    // happy path
    public function testShouldReconcileWhenViewerAlreadyRepliedAndMultipleRepliesAreAllowed(): void
    {
        $this->disableCompletionStatusFilter();

        $this->setUpQuestionnaire();

        $this->questionnaireStep->method('isClosed')->willReturn(false);

        $this->setUpRequirement();

        $reply = $this->createMock(Reply::class);
        $reply->method('getCompletionStatus')->willReturn(ContributionCompletionStatus::MISSING_REQUIREMENTS);

        $this->replyRepository->method('findBy')->willReturnCallback(function ($criteria) use ($reply) {
            if (isset($criteria['participant']) && $criteria['participant'] === $this->participant) {
                return [$reply];
            }

            if ((isset($criteria['author']) && $criteria['author'] === $this->viewer)) {
                return [$reply];
            }

            return [];
        });

        $this->questionnaire->method('isMultipleRepliesAllowed')->willReturn(true);

        $reply->expects($this->once())->method('setContributor');

        $this->em->expects($this->once())->method('flush');

        $this->replyReconcilier->reconcile($this->participant, $this->viewer);
    }

    private function disableCompletionStatusFilter(): void
    {
        $filtersMock = $this->createMock(FilterCollection::class);
        $this->em->method('getFilters')->willReturn($filtersMock);
        $filtersMock->expects($this->once())->method('isEnabled')->with(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(true);
        $filtersMock->expects($this->once())->method('disable')->with(ContributionCompletionStatusFilter::FILTER_NAME);
    }
}
