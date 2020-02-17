<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Resolver\LocaleResolver;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\EventListener\CommentSubscriber;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Comment\CommentShowUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserShowUrlBySlugResolver;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorMessage;
use Capco\AppBundle\GraphQL\Resolver\User\UserDisableNotificationsUrlResolver;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentUpdateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorAnonymousMessage;
use Capco\AppBundle\GraphQL\Resolver\User\UserShowNotificationsPreferencesUrlResolver;

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

                    $this->mailer->sendMessage(
                        CommentCreateAdminAnonymousMessage::create(
                            $comment,
                            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->commentResolver->getAdminUrl($comment, true)
                        )
                    );
                } else {
                    $this->mailer->sendMessage(
                        CommentCreateAdminMessage::create(
                            $comment,
                            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->commentResolver->getAdminUrl($comment, true),
                            $this->userUrlResolver->__invoke($comment->getAuthor())
                        )
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
                    $this->mailer->sendMessage(
                        CommentCreateAuthorAnonymousMessage::create(
                            $comment,
                            $user->getEmail(),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->userDisableNotificationsUrlResolver->__invoke($user),
                            $this->userShowNotificationsPreferencesUrlResolver->__invoke()
                        )
                    );
                } else {
                    $this->mailer->sendMessage(
                        CommentCreateAuthorMessage::create(
                            $comment,
                            $user->getEmail(),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->userDisableNotificationsUrlResolver->__invoke($user),
                            $this->userShowNotificationsPreferencesUrlResolver->__invoke(),
                            $this->userUrlResolver->__invoke($comment->getAuthor())
                        )
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

                        $this->mailer->sendMessage(
                            CommentDeleteAdminAnonymousMessage::create(
                                $comment,
                                $this->siteParams->getValue(
                                    'admin.mail.notifications.receive_address'
                                ),
                                $this->resolveProposalUrlBySlugs(
                                    $comment['projectSlug'],
                                    $comment['stepSlug'],
                                    $comment['proposalSlug']
                                )
                            )
                        );
                    } else {
                        $this->mailer->sendMessage(
                            CommentDeleteAdminMessage::create(
                                $comment,
                                $this->siteParams->getValue(
                                    'admin.mail.notifications.receive_address'
                                ),
                                $this->resolveProposalUrlBySlugs(
                                    $comment['projectSlug'],
                                    $comment['stepSlug'],
                                    $comment['proposalSlug']
                                ),
                                $this->userShowUrlBySlugResolver->__invoke($comment['userSlug'])
                            )
                        );
                    }

                    break;
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

                    $this->mailer->sendMessage(
                        CommentUpdateAdminAnonymousMessage::create(
                            $comment,
                            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->commentResolver->getAdminUrl($comment, true)
                        )
                    );
                } else {
                    $this->mailer->sendMessage(
                        CommentUpdateAdminMessage::create(
                            $comment,
                            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->commentResolver->getAdminUrl($comment, true),
                            $this->userUrlResolver->__invoke($comment->getAuthor())
                        )
                    );
                }
            }
        }
    }
}
