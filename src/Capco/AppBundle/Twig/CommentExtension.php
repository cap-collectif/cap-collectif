<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class CommentExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('capco_comment_can_show', [
                CommentRuntime::class,
                'canShowCommentOnObject',
            ]),
            new TwigFunction('capco_comment_proposal_count', [
                CommentRuntime::class,
                'getProposalCommentsCount',
            ]),
            new TwigFunction('capco_comment_can_add', [
                CommentRuntime::class,
                'canAddCommentOnObject',
            ]),
            new TwigFunction('capco_comment_object_url', [
                CommentRuntime::class,
                'getRelatedObjectUrl',
            ]),
            new TwigFunction('capco_comment_object', [CommentRuntime::class, 'getRelatedObject']),
            new TwigFunction('capco_comment_object_admin_url', [
                CommentRuntime::class,
                'getRelatedObjectAdminUrl',
            ]),
        ];
    }
}
