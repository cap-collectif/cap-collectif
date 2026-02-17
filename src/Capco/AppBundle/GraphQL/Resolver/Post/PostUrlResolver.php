<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class PostUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router,
        private readonly LoggerInterface $logger,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    public function __invoke(Post $post): string
    {
        $locale = $this->localeResolver->resolve();
        $slug = $post->getSlug($locale, true);
        if (!$slug) {
            $this->logger->warning('Empty slug for post ' . $post->getId());

            return '';
        }

        return $this->router->generate(
            'app_blog_show',
            ['slug' => $slug, '_locale' => $locale],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
