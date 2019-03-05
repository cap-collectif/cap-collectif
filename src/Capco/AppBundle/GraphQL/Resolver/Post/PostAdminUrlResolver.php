<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class PostAdminUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(Post $post): string
    {
        return $this->router->generate(
            'admin_capco_app_post_edit',
            ['id' => $post->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
