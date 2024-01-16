<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\PostVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class PostAdminUrlResolver implements QueryInterface
{
    private RouterInterface $router;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        RouterInterface $router,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->router = $router;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Post $post): string
    {
        return $this->router->generate(
            'capco_admin_edit_post',
            ['postId' => $post->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function isGranted(Post $post): bool
    {
        return $this->authorizationChecker->isGranted(PostVoter::EDIT, $post);
    }
}
