<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\GraphQL\Resolver\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentCreateAuthorMessage;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\SiteParameter\Resolver;

class CommentNotifier extends BaseNotifier
{
    protected $commentResolver;
    protected $proposalResolver;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver, CommentResolver $commentResolver, ProposalResolver $proposalResolver)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->commentResolver = $commentResolver;
        $this->proposalResolver = $proposalResolver;
    }

    public function onCreate(Comment $comment)
    {
        if ($comment instanceof ProposalComment) {
            $isAnonymous = null === $comment->getAuthor();

            if ($comment->getProposal()->getProposalForm()->isNotifyingCommentOnCreate()) {
                if ($isAnonymous) {
                    $this->mailer->sendMessage(CommentCreateAdminAnonymousMessage::create(
                        $comment,
                        $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                        null,
                        $this->commentResolver->getUrlOfRelatedObject($comment, true),
                        $this->commentResolver->getAdminUrlOfRelatedObject($comment, true)
                    ));
                } else {
                    $this->mailer->sendMessage(CommentCreateAdminMessage::create(
                        $comment,
                        $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                        null,
                        $this->commentResolver->getUrlOfRelatedObject($comment, true),
                        $this->commentResolver->getAdminUrlOfRelatedObject($comment, true),
                        $this->userResolver->resolveShowUrl($comment->getAuthor())
                    ));
                }
            }

            $user = $comment->getProposal()->getAuthor();
            if ($user->getNotificationsConfiguration()->isOnProposalCommentMail() &&
                $user !== $comment->getAuthor()) {
                if ($isAnonymous) {
                    $this->mailer->sendMessage(CommentCreateAnonymousMessage::create(
                        $comment,
                        $user->getEmail(),
                        null,
                        $this->proposalResolver->resolveShowUrl($comment->getProposal()),
                        $this->userResolver->resolveDisableNotificationsUrl($user)
                    ));
                } else {
                    $this->mailer->sendMessage(CommentCreateAuthorMessage::create(
                        $comment,
                        $user->getEmail(),
                        null,
                        $this->proposalResolver->resolveShowUrl($comment->getProposal()),
                        $this->userResolver->resolveDisableNotificationsUrl($user),
                        $this->userResolver->resolveShowUrl($comment->getAuthor())
                    ));
                }
            }
        }
    }

    public function onDelete(Comment $proposal)
    {
    }

    public function onUpdate(Comment $proposal)
    {
    }

    public function send()
    {
    }
}
