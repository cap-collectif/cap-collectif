<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Comment\CommentShowUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserDisableNotificationsUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserShowNotificationsPreferencesUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserShowUrlBySlugResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminMessage;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class CommentNotifierTest extends TestCase
{
    public function testOnCreateSendsAdminMessageForAuthenticatedCommentWhenEnabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(true, false);

        $mailer
            ->expects($this->once())
            ->method('createAndSendMessage')
            ->with(CommentCreateAdminMessage::class, $comment, $this->isType('array'), null, 'admin@example.com')
        ;

        $notifier->onCreate($comment);
    }

    public function testOnCreateDoesNotSendAdminMessageWhenDisabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(false, false);

        $mailer->expects($this->never())->method('createAndSendMessage');

        $notifier->onCreate($comment);
    }

    public function testOnCreateSendsAdminMessageForAnonymousCommentWhenEnabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(true, true);

        $mailer
            ->expects($this->once())
            ->method('createAndSendMessage')
            ->with(CommentCreateAdminAnonymousMessage::class, $comment, $this->isType('array'), null, 'admin@example.com')
        ;

        $notifier->onCreate($comment);
    }

    public function testOnCreateDoesNotSendAnonymousAdminMessageWhenDisabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(false, true);

        $mailer->expects($this->never())->method('createAndSendMessage');

        $notifier->onCreate($comment);
    }

    public function testOnCreateNotifiesProposalAuthorWhenTheirPreferenceIsEnabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(false, false, true);

        $mailer
            ->expects($this->once())
            ->method('createAndSendMessage')
            ->with(CommentCreateAuthorMessage::class, $comment, $this->isType('array'), $this->isInstanceOf(User::class))
        ;

        $notifier->onCreate($comment);
    }

    public function testOnCreateDoesNotNotifyProposalAuthorWhenTheirPreferenceIsDisabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(false, false, false);

        $mailer->expects($this->never())->method('createAndSendMessage');

        $notifier->onCreate($comment);
    }

    public function testOnUpdateSendsAdminMessageWhenEnabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(true, false);

        $mailer
            ->expects($this->once())
            ->method('createAndSendMessage')
            ->with(CommentUpdateAdminMessage::class, $comment, $this->isType('array'), null, 'admin@example.com')
        ;

        $notifier->onUpdate($comment);
    }

    public function testOnUpdateDoesNotSendAdminMessageWhenDisabled(): void
    {
        [$notifier, $comment, $mailer] = $this->createNotifierAndComment(false, false);

        $mailer->expects($this->never())->method('createAndSendMessage');

        $notifier->onUpdate($comment);
    }

    /**
     * @return array{CommentNotifier, ProposalComment, MailerService}
     */
    private function createNotifierAndComment(
        bool $isNotifying,
        bool $isAnonymous,
        bool $isAuthorNotified = false
    ): array {
        $commentAuthor = $isAnonymous ? null : $this->createMock(User::class);
        $author = $isAuthorNotified ? $this->createMock(User::class) : $commentAuthor;
        if (!$author instanceof User) {
            $author = $this->createMock(User::class);
        }
        $authorNotifications = $this->createMock(UserNotificationsConfiguration::class);
        $authorNotifications->method('isOnProposalCommentMail')->willReturn($isAuthorNotified);
        $author->method('getNotificationsConfiguration')->willReturn($authorNotifications);

        $notificationConfiguration = $this->createMock(ProposalFormNotificationConfiguration::class);
        $notificationConfiguration->method('getEmail')->willReturn('admin@example.com');

        $proposalForm = $this->createMock(ProposalForm::class);
        $proposalForm->method('isNotifyingCommentOnCreate')->willReturn($isNotifying);
        $proposalForm->method('isNotifyingCommentOnUpdate')->willReturn($isNotifying);
        $proposalForm->method('getNotificationsConfiguration')->willReturn($notificationConfiguration);

        $proposal = $this->createMock(Proposal::class);
        $proposal->method('getProposalForm')->willReturn($proposalForm);
        $proposal->method('getAuthor')->willReturn($author);

        $comment = $this->createMock(ProposalComment::class);
        $comment->method('getProposal')->willReturn($proposal);
        $comment->method('getAuthor')->willReturn($commentAuthor);
        $comment->method('getAuthorName')->willReturn('Anonymous');

        $mailer = $this->createMock(MailerService::class);
        $commentResolver = $this->createMock(CommentResolver::class);
        $commentResolver->method('getAdminUrl')->willReturn('https://capco.test/admin/comment');

        $commentShowUrlResolver = $this->createMock(CommentShowUrlResolver::class);
        $commentShowUrlResolver->method('__invoke')->willReturn('https://capco.test/comment');

        $userUrlResolver = $this->createMock(UserUrlResolver::class);
        $userUrlResolver->method('__invoke')->willReturn('https://capco.test/profile');

        $manager = $this->createMock(Manager::class);
        $manager->method('isActive')->willReturn(false);

        return [
            new CommentNotifier(
                $mailer,
                $this->createMock(SiteParameterResolver::class),
                $commentResolver,
                $userUrlResolver,
                $this->createMock(UserShowNotificationsPreferencesUrlResolver::class),
                $this->createMock(UserDisableNotificationsUrlResolver::class),
                $this->createMock(UserShowUrlBySlugResolver::class),
                $this->createMock(TranslatorInterface::class),
                $commentShowUrlResolver,
                $this->createMock(RouterInterface::class),
                $this->createMock(LocaleResolver::class),
                $manager
            ),
            $comment,
            $mailer,
        ];
    }
}
