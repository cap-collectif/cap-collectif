<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\EventListener\CommentSubscriber;
use Capco\AppBundle\GraphQL\Resolver\Comment\CommentShowUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
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
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Translation\TranslatorInterface;

class CommentNotifier extends BaseNotifier
{
    protected $commentResolver;
    protected $proposalResolver;
    protected $proposalUrlResolver;
    protected $userUrlResolver;
    protected $translator;
    protected $commentShowUrlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        CommentResolver $commentResolver,
        ProposalResolver $proposalResolver,
        ProposalUrlResolver $proposalUrlResolver,
        UserUrlResolver $userUrlResolver,
        TranslatorInterface $translator,
        CommentShowUrlResolver $commentShowUrlResolver
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->commentResolver = $commentResolver;
        $this->proposalResolver = $proposalResolver;
        $this->proposalUrlResolver = $proposalUrlResolver;
        $this->userUrlResolver = $userUrlResolver;
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
                    $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                    $comment->setAuthorName($author);

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
                    $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                    $comment->setAuthorName($author);
                    $this->mailer->sendMessage(
                        CommentCreateAuthorAnonymousMessage::create(
                            $comment,
                            $user->getEmail(),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->userResolver->resolveDisableNotificationsUrl($user),
                            $this->userResolver->resolveShowNotificationsPreferencesUrl()
                        )
                    );
                } else {
                    $this->mailer->sendMessage(
                        CommentCreateAuthorMessage::create(
                            $comment,
                            $user->getEmail(),
                            $this->commentShowUrlResolver->__invoke($comment),
                            $this->userResolver->resolveDisableNotificationsUrl($user),
                            $this->userResolver->resolveShowNotificationsPreferencesUrl(),
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
                        $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                        $comment['username'] = empty($comment['username'])
                            ? $author
                            : $comment['username'];
                        $this->mailer->sendMessage(
                            CommentDeleteAdminAnonymousMessage::create(
                                $comment,
                                $this->siteParams->getValue(
                                    'admin.mail.notifications.receive_address'
                                ),
                                $this->proposalResolver->resolveShowUrlBySlug(
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
                                $this->proposalResolver->resolveShowUrlBySlug(
                                    $comment['projectSlug'],
                                    $comment['stepSlug'],
                                    $comment['proposalSlug']
                                ),
                                $this->userResolver->resolveShowUrlBySlug($comment['userSlug'])
                            )
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
                    $author = $this->translator->trans('anonymous-user', [], 'CapcoAppBundle');
                    $comment->setAuthorName($author);

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
