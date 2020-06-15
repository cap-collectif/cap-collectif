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
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminMessage;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class CommentNotifier extends BaseNotifier
{
    protected $commentResolver;
    protected $userUrlResolver;
    protected $userShowNotificationsPreferencesUrlResolver;
    protected $userDisableNotificationsUrlResolver;
    protected $userShowUrlBySlugResolver;
    protected $translator;
    protected $commentShowUrlResolver;

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
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->commentResolver = $commentResolver;
        $this->userUrlResolver = $userUrlResolver;
        $this->userShowNotificationsPreferencesUrlResolver = $userShowNotificationsPreferencesUrlResolver;
        $this->userDisableNotificationsUrlResolver = $userDisableNotificationsUrlResolver;
        $this->userShowUrlBySlugResolver = $userShowUrlBySlugResolver;
        $this->commentShowUrlResolver = $commentShowUrlResolver;
        $this->translator = $translator;
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
                        ]
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
                        ]
                    );
                }
            }

            $user = $comment->getProposal()->getAuthor();
            if (
                $user->getNotificationsConfiguration()->isOnProposalCommentMail() &&
                $user !== $comment->getAuthor()
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
                            ]
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
                            ]
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
                        ]
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
                        ]
                    );
                }
            }
        }
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
