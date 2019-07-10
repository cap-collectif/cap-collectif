<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class CommentExtension extends AbstractExtension
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

    public function getFunctions(): array
    {
        return [
            new TwigFunction('capco_comment_can_show', [$this, 'canShowCommentOnObject']),
            new TwigFunction('capco_comment_proposal_count', [$this, 'getProposalCommentsCount']),
            new TwigFunction('capco_comment_can_add', [$this, 'canAddCommentOnObject']),
            new TwigFunction('capco_comment_object_url', [$this, 'getRelatedObjectUrl']),
            new TwigFunction('capco_comment_object', [$this, 'getRelatedObject']),
            new TwigFunction('capco_comment_object_admin_url', [$this, 'getRelatedObjectAdminUrl'])
        ];
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
