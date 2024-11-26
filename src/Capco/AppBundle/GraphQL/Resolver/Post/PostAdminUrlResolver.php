<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\PostVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class PostAdminUrlResolver implements QueryInterface
{
    private readonly AuthorizationCheckerInterface $authorizationChecker;
    private readonly RequestStack $requestStack;

    public function __construct(
        AuthorizationCheckerInterface $authorizationChecker,
        RequestStack $requestStack
    ) {
        $this->authorizationChecker = $authorizationChecker;
        $this->requestStack = $requestStack;
    }

    public function __invoke(Post $post): string
    {
        $postGlobalId = GlobalId::toGlobalId('Post', $post->getId());
        $baseUrl = '';
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $baseUrl = $request->getSchemeAndHttpHost();
        }

        return "{$baseUrl}/admin-next/post?id={$postGlobalId}";
    }

    public function isGranted(Post $post): bool
    {
        return $this->authorizationChecker->isGranted(PostVoter::EDIT, $post);
    }
}
