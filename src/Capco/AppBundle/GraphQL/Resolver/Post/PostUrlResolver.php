<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class PostUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(Post $post): string
    {
        return $this->router->generate('app_blog_show', ['slug' => $post->getSlug()], UrlGeneratorInterface::ABSOLUTE_URL);
    }
}
