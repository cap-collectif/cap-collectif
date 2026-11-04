<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\User\ContributorNameResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Twig\Extension\RuntimeExtensionInterface;

class AuthorRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        private readonly ContributorNameResolver $nameResolver,
        private readonly UrlGeneratorInterface $router,
        private readonly Manager $toggleManager
    ) {}

    /** @return array{name: ?string, url: ?string, globalId: ?string} */
    public function getProfile(Organization|User|null $author, bool $private = false): array
    {
        if (null === $author) {
            return ['name' => null, 'url' => null, 'globalId' => null];
        }

        $name = $author instanceof User
            ? $this->nameResolver->resolveUsername($author)
            : $author->getUsername();
        $profile = [
            'name' => $name,
            'url' => null,
            'globalId' => GlobalId::toGlobalId($author instanceof Organization ? 'Organization' : 'User', $author->getId()),
        ];

        if ($private || !$this->toggleManager->isActive(Manager::profiles) || ($author instanceof User && $author->isAnonymized())) {
            return $profile;
        }

        $profile['url'] = $this->router->generate(
            $author instanceof Organization ? 'capco_organization_profile_show_all' : 'capco_user_profile_show_all',
            ['slug' => $author->getSlug()]
        );

        return $profile;
    }
}
