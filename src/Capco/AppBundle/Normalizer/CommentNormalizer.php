<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProposalComment;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class CommentNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $tokenStorage;
    private $normalizer;

    public function __construct(
        RouterInterface $router,
        TokenStorageInterface $tokenStorage,
        ObjectNormalizer $normalizer
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->tokenStorage = $tokenStorage;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array('Elasticsearch', $groups, true)) {
            return $data;
        }

        $data['_links'] = [
            'edit' => $this->router->generate(
                'app_comment_edit',
                ['commentId' => $object->getId()],
                true
            )
        ];

        $data['hasUserVoted'] = $this->hasUserVoted($object);
        $data['hasUserReported'] = $this->hasUserReported($object);
        $data['canEdit'] = $this->canEdit($object);

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof PostComment ||
            $data instanceof EventComment ||
            $data instanceof ProposalComment;
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

        return $comment->userHasReport($user);
    }
}
