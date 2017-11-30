<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class CommentSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $tokenStorage;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents()
    {
        return [
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\IdeaComment', 'method' => 'onPostCommentSerialize'],
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\PostComment', 'method' => 'onPostCommentSerialize'],
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\EventComment', 'method' => 'onPostCommentSerialize'],
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\ProposalComment', 'method' => 'onPostCommentSerialize'],
        ];
    }

    public function onPostCommentSerialize(ObjectEvent $event)
    {
        $comment = $event->getObject();
        $event->getVisitor()->addData(
            '_links',
            [
                'edit' => $this->router->generate('app_comment_edit', ['commentId' => $comment->getId()], true),
            ]
        );

        $event->getVisitor()->addData('has_user_voted', $this->hasUserVoted($comment));
        $event->getVisitor()->addData('has_user_reported', $this->hasUserReported($comment));
        $event->getVisitor()->addData('can_edit', $this->canEdit($comment));
    }

    private function canEdit($comment)
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ($user === 'anon.') {
            return false;
        }

        return $comment->canContribute() && $comment->getAuthor() === $user;
    }

    private function hasUserVoted($comment)
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ($user === 'anon.') {
            return false;
        }

        return $comment->userHasVote($user);
    }

    private function hasUserReported($comment)
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ($user === 'anon.') {
            return false;
        }

        return $comment->userHasReport($user);
    }
}
