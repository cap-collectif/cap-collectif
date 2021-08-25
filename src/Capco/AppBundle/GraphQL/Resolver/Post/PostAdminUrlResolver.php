<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\PostVoter;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class PostAdminUrlResolver implements ResolverInterface
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
            'admin_capco_app_post_edit',
            ['id' => $post->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function isGranted(Post $post): bool
    {
        return $this->authorizationChecker->isGranted(PostVoter::EDIT, $post);
    }
}
