<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProposalComment;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class CommentNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private RouterInterface $router,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly ObjectNormalizer $normalizer
    ) {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);
        if ($groups === $object::getElasticsearchSerializationGroups()) {
            return $data;
        }

        $data['_links'] = [
            'edit' => $this->router->generate(
                'app_comment_edit',
                ['commentId' => $object->getId()],
                true
            ),
        ];

        $data['hasUserVoted'] = $this->hasUserVoted($object);
        $data['hasUserReported'] = $this->hasUserReported($object);
        $data['canEdit'] = $this->canEdit($object);

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof PostComment
            || $data instanceof EventComment
            || $data instanceof ProposalComment;
    }

    private function canEdit(Comment $comment): bool
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ('anon.' === $user) {
            return false;
        }

        return $comment->canContribute($user) && $comment->getAuthor() === $user;
    }

    private function hasUserVoted(Comment $comment): bool
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ('anon.' === $user) {
            return false;
        }

        return $comment->userHasVote($user);
    }

    private function hasUserReported(Comment $comment): bool
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ('anon.' === $user) {
            return false;
        }

        return $comment->userDidReport($user);
    }
}
