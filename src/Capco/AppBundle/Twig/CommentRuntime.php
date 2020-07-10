<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Twig\Extension\RuntimeExtensionInterface;

class CommentRuntime implements RuntimeExtensionInterface
{
    protected $resolver;
    protected $proposalCommentRepository;

    public function __construct(
        CommentResolver $resolver,
        ProposalCommentRepository $proposalCommentRepository
    ) {
        $this->resolver = $resolver;
        $this->proposalCommentRepository = $proposalCommentRepository;
    }

    public function getRelatedObjectUrl(Comment $comment, $absolute = false)
    {
        return $this->resolver->getUrlOfRelatedObject($comment, $absolute);
    }

    public function getRelatedObjectAdminUrl(Comment $comment, $absolute = false): string
    {
        return $this->resolver->getAdminUrlOfRelatedObject($comment, $absolute);
    }

    public function getRelatedObject(Comment $comment)
    {
        return $this->resolver->getRelatedObject($comment);
    }

    public function canShowCommentOnObject(CommentableInterface $object): bool
    {
        return $object->isCommentable();
    }

    public function canAddCommentOnObject(CommentableInterface $object): bool
    {
        return $object->acceptNewComments();
    }

    public function getProposalCommentsCount(CommentableInterface $object): int
    {
        return $this->proposalCommentRepository->countCommentsByCommentable($object);
    }
}
