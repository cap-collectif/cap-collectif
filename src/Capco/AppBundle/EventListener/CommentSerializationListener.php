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

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\PostComment',
                'method' => 'onPostCommentSerialize',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\EventComment',
                'method' => 'onPostCommentSerialize',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\ProposalComment',
                'method' => 'onPostCommentSerialize',
            ],
        ];
    }

    public function onPostCommentSerialize(ObjectEvent $event)
    {
        // We skip if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        $comment = $event->getObject();
        $event
            ->getVisitor()
            ->addData('_links', [
                'edit' => $this->router->generate(
                    'app_comment_edit',
                    ['commentId' => $comment->getId()],
                    true
                ),
            ]);

        $event->getVisitor()->addData('hasUserVoted', $this->hasUserVoted($comment));
        $event->getVisitor()->addData('hasUserReported', $this->hasUserReported($comment));
        $event->getVisitor()->addData('canEdit', $this->canEdit($comment));
    }

    private function canEdit($comment)
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ('anon.' === $user) {
            return false;
        }

        return $comment->canContribute($user) && $comment->getAuthor() === $user;
    }

    private function hasUserVoted($comment)
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ('anon.' === $user) {
            return false;
        }

        return $comment->userHasVote($user);
    }

    private function hasUserReported($comment)
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ('anon.' === $user) {
            return false;
        }

        return $comment->userHasReport($user);
    }
}
