<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\EventListener\CommentSubscriber;
use Capco\AppBundle\GraphQL\Resolver\Comment\CommentShowUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserDisableNotificationsUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserShowNotificationsPreferencesUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserShowUrlBySlugResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Comment\CommentConfirmAnonymousEmailMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentModerationApprovedMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentModerationNotifAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentModerationRejectedMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminMessage;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CommentNotifier extends BaseNotifier
{
    protected CommentResolver $commentResolver;
    protected UserUrlResolver $userUrlResolver;
    protected UserShowNotificationsPreferencesUrlResolver $userShowNotificationsPreferencesUrlResolver;
    protected UserDisableNotificationsUrlResolver $userDisableNotificationsUrlResolver;
    protected UserShowUrlBySlugResolver $userShowUrlBySlugResolver;
    protected TranslatorInterface $translator;
    protected CommentShowUrlResolver $commentShowUrlResolver;
    private readonly Manager $manager;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        CommentResolver $commentResolver,
        UserUrlResolver $userUrlResolver,
        UserShowNotificationsPreferencesUrlResolver $userShowNotificationsPreferencesUrlResolver,
        UserDisableNotificationsUrlResolver $userDisableNotificationsUrlResolver,
        UserShowUrlBySlugResolver $userShowUrlBySlugResolver,
        TranslatorInterface $translator,
        CommentShowUrlResolver $commentShowUrlResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        Manager $manager
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->commentResolver = $commentResolver;
        $this->userUrlResolver = $userUrlResolver;
        $this->userShowNotificationsPreferencesUrlResolver = $userShowNotificationsPreferencesUrlResolver;
        $this->userDisableNotificationsUrlResolver = $userDisableNotificationsUrlResolver;
        $this->userShowUrlBySlugResolver = $userShowUrlBySlugResolver;
        $this->commentShowUrlResolver = $commentShowUrlResolver;
        $this->translator = $translator;
        $this->manager = $manager;
    }

    public function onCreate(Comment $comment)
    {
        if ($comment instanceof ProposalComment) {
            $isAnonymous = null === $comment->getAuthor();

            if (
                $comment
                    ->getProposal()
                    ->getProposalForm()
                    ->isNotifyingCommentOnCreate()
            ) {
                if ($isAnonymous) {
                    if (empty($comment->getAuthorName())) {
                        $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                        $comment->setAuthorName($author);
                    }

                    $this->mailer->createAndSendMessage(
                        CommentCreateAdminAnonymousMessage::class,
                        $comment,
                        [
                            'comment' => $comment,
                            'commentURL' => $this->commentShowUrlResolver->__invoke($comment),
                            'adminURL' => $this->commentResolver->getAdminUrl($comment, true),
                        ],
                        null,
                        $comment
                            ->getProposal()
                            ->getProposalForm()
                            ->getNotificationsConfiguration()
                            ->getEmail()
                    );
                } else {
                    $this->mailer->createAndSendMessage(
                        CommentCreateAdminMessage::class,
                        $comment,
                        [
                            'comment' => $comment,
                            'commentURL' => $this->commentShowUrlResolver->__invoke($comment),
                            'adminURL' => $this->commentResolver->getAdminUrl($comment, true),
                            'authorURL' => $this->userUrlResolver->__invoke($comment->getAuthor()),
                        ],
                        null,
                        $comment
                            ->getProposal()
                            ->getProposalForm()
                            ->getNotificationsConfiguration()
                            ->getEmail()
                    );
                }
            }

            $isModerationEnabled = $this->manager->isActive(Manager::moderation_comment);
            if ($isModerationEnabled && $comment->isPending()) {
                return;
            }

            $user = $comment->getProposal()->getAuthor();
            if (
                $user->getNotificationsConfiguration()->isOnProposalCommentMail()
                && $user !== $comment->getAuthor()
            ) {
                if ($isAnonymous) {
                    if (empty($comment->getAuthorName())) {
                        $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                        $comment->setAuthorName($author);
                    }
                    $this->mailer->createAndSendMessage(
                        CommentCreateAuthorAnonymousMessage::class,
                        $comment,
                        [
                            'elementURL' => $this->commentShowUrlResolver->__invoke($comment),
                            'disableNotificationURL' => $this->userDisableNotificationsUrlResolver->__invoke(
                                $user
                            ),
                            'notificationURL' => $this->userShowNotificationsPreferencesUrlResolver->__invoke(),
                        ],
                        $user
                    );
                } else {
                    $this->mailer->createAndSendMessage(
                        CommentCreateAuthorMessage::class,
                        $comment,
                        [
                            'userURL' => $this->userDisableNotificationsUrlResolver->__invoke(
                                $user
                            ),
                            'elementURL' => $this->commentShowUrlResolver->__invoke($comment),
                            'disableNotificationURL' => $this->userDisableNotificationsUrlResolver->__invoke(
                                $user
                            ),
                            'notificationURL' => $this->userShowNotificationsPreferencesUrlResolver->__invoke(),
                        ],
                        $user
                    );
                }
            }
        }
    }

    /**
     * @param array $comment
     *                       The comment is an array because a Comment entity doesn't have soft delete
     *                       The array looks like this :
     *                       [
     *                       'username' => string,
     *                       'notifying' => boolean,
     *                       'anonymous' => boolean,
     *                       'notifyTo' => CommentSubscriber::NOTIFY_TO_ADMIN | CommentSubscriber::NOTIFY_TO_USER,
     *                       'userSlug' => string | null,
     *                       'body' => string,
     *                       'proposal' => string,
     *                       'projectSlug' => string,
     *                       'stepSlug' => string,
     *                       'proposalSlug' => string,
     *                       'proposalFormNotificationEmail' => string | null
     *                       ]
     */
    public function onDelete(array $comment)
    {
        if ($comment['notifying']) {
            switch ($comment['notifyTo']) {
                case CommentSubscriber::NOTIFY_TO_ADMIN:
                    if ($comment['anonymous']) {
                        if (empty($comment['username'])) {
                            $author = $this->translator->trans(
                                'anonymous-user',
                                [],
                                'CapcoAppBundle'
                            );
                            $comment['username'] = $author;
                        }

                        $this->mailer->createAndSendMessage(
                            CommentDeleteAdminAnonymousMessage::class,
                            null,
                            [
                                'comment' => $comment,
                                'proposalURL' => $this->resolveProposalUrlBySlugs(
                                    $comment['projectSlug'],
                                    $comment['stepSlug'],
                                    $comment['proposalSlug']
                                ),
                            ],
                            null,
                            $comment['proposalFormNotificationEmail']
                        );
                    } else {
                        $this->mailer->createAndSendMessage(
                            CommentDeleteAdminMessage::class,
                            null,
                            [
                                'comment' => $comment,
                                'authorURL' => $this->userShowUrlBySlugResolver->__invoke(
                                    $comment['userSlug']
                                ),
                                'proposalURL' => $this->resolveProposalUrlBySlugs(
                                    $comment['projectSlug'],
                                    $comment['stepSlug'],
                                    $comment['proposalSlug']
                                ),
                            ],
                            null,
                            $comment['proposalFormNotificationEmail']
                        );
                    }

                    break;
            }
        }
    }

    public function onUpdate(Comment $comment)
    {
        if ($comment instanceof ProposalComment) {
            $isAnonymous = null === $comment->getAuthor();

            if (
                $comment
                    ->getProposal()
                    ->getProposalForm()
                    ->isNotifyingCommentOnUpdate()
            ) {
                if ($isAnonymous) {
                    if (empty($comment->getAuthorName())) {
                        $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                        $comment->setAuthorName($author);
                    }

                    $this->mailer->createAndSendMessage(
                        CommentUpdateAdminAnonymousMessage::class,
                        $comment,
                        [
                            'comment' => $comment,
                            'commentURL' => $this->commentShowUrlResolver->__invoke($comment),
                            'adminURL' => $this->commentResolver->getAdminUrl($comment, true),
                        ],
                        null,
                        $comment
                            ->getProposal()
                            ->getProposalForm()
                            ->getNotificationsConfiguration()
                            ->getEmail()
                    );
                } else {
                    $this->mailer->createAndSendMessage(
                        CommentUpdateAdminMessage::class,
                        $comment,
                        [
                            'comment' => $comment,
                            'commentURL' => $this->commentShowUrlResolver->__invoke($comment),
                            'adminURL' => $this->commentResolver->getAdminUrl($comment, true),
                            'authorURL' => $this->userUrlResolver->__invoke($comment->getAuthor()),
                        ],
                        null,
                        $comment
                            ->getProposal()
                            ->getProposalForm()
                            ->getNotificationsConfiguration()
                            ->getEmail()
                    );
                }
            }
        }
    }

    public function onConfirmAnonymousEmail(Comment $comment)
    {
        $params = [
            'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
            'confirmAddressLink' => $this->router->generate(
                'comment_confirm_email',
                ['token' => $comment->getConfirmationToken()],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
        ];

        $this->mailer->createAndSendMessage(
            CommentConfirmAnonymousEmailMessage::class,
            $comment,
            $params,
            null,
            $comment->getAuthorEmail()
        );
    }

    public function onModerationApproved(Comment $comment)
    {
        $authorEmail = $comment->getAuthor()
            ? $comment->getAuthor()->getEmail()
            : $comment->getAuthorEmail();

        if (!$authorEmail) {
            return;
        }

        $params = [
            'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
            'commentUrl' => $this->commentShowUrlResolver->__invoke($comment),
        ];

        $this->mailer->createAndSendMessage(
            CommentModerationApprovedMessage::class,
            $comment,
            $params,
            null,
            $authorEmail
        );
    }

    public function onModerationRejected(Comment $comment): void
    {
        $authorEmail = $comment->getAuthor()
            ? $comment->getAuthor()->getEmail()
            : $comment->getAuthorEmail();

        if (!$authorEmail) {
            return;
        }

        $params = [
            'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
        ];

        $this->mailer->createAndSendMessage(
            CommentModerationRejectedMessage::class,
            $comment,
            $params,
            null,
            $authorEmail
        );
    }

    public function onModerationNotifAdmin(Comment $comment): void
    {
        $commentAdminUrl = $this->router->generate(
            'admin_capco_app_comment_edit',
            ['id' => $comment->getId()],
            RouterInterface::ABSOLUTE_URL
        );
        $params = [
            'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
            'commentAdminUrl' => $commentAdminUrl,
        ];

        $this->mailer->createAndSendMessage(
            CommentModerationNotifAdminMessage::class,
            $comment,
            $params
        );
    }

    private function resolveProposalUrlBySlugs(
        string $projectSlug,
        string $stepSlug,
        string $proposalSlug
    ): ?string {
        return $this->router->generate(
            'app_project_show_proposal',
            compact('projectSlug', 'stepSlug', 'proposalSlug'),
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
