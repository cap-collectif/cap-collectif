<?php
namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
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

    public function normalize($object, $format = null, array $context = array())
    {
        $groups = array_key_exists('groups', $context) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array('Elasticsearch', $groups)) {
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

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof PostComment ||
            $data instanceof EventComment ||
            $data instanceof ProposalComment;
    }
}
