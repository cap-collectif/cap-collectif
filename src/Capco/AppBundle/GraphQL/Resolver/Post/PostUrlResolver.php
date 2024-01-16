<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class PostUrlResolver implements QueryInterface
{
    private RouterInterface $router;
    private LoggerInterface $logger;

    public function __construct(RouterInterface $router, LoggerInterface $logger)
    {
        $this->router = $router;
        $this->logger = $logger;
    }

    public function __invoke(Post $post): string
    {
        $slug = $post->translate()->getSlug();
        if (!$slug) {
            $this->logger->warning('Empty slug for post ' . $post->getId());

            return '';
        }

        return $this->router->generate(
            'app_blog_show',
            ['slug' => $slug],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
