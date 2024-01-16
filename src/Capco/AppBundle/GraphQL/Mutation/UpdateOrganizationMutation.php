<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationSocialNetworks;
use Capco\AppBundle\Form\OrganizationType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\OrganizationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class UpdateOrganizationMutation implements MutationInterface
{
    use MutationTrait;

    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;
    private SluggerInterface $slugger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        SluggerInterface $slugger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->slugger = $slugger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $organizationId = $input->offsetGet('organizationId');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        if (!$organization) {
            return ['organization' => null, 'errorCode' => self::ORGANIZATION_NOT_FOUND];
        }

        $data = $input->getArrayCopy();
        unset($data['organizationId']);

        LocaleUtils::indexTranslations($data);
        $this->handleSocialNetworks($organization, $data);

        if (isset($data['translations'])) {
            $this->updateSlug($organization, $data['translations']);
        }

        $form = $this->formFactory->create(OrganizationType::class, $organization);
        $form->submit($data, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }
        $this->em->flush();

        return ['organization' => $organization, 'errorCode' => null];
    }

    public function handleSocialNetworks(Organization $organization, array &$data): void
    {
        $socialNetworks = $organization->getOrganizationSocialNetworks();

        if (!$socialNetworks) {
            $socialNetworks = (new OrganizationSocialNetworks())->setOrganization($organization);
        }

        $socialNetworksEnum = [
            'facebookUrl',
            'twitterUrl',
            'youtubeUrl',
            'linkedInUrl',
            'instagramUrl',
            'webPageUrl',
        ];

        foreach ($socialNetworksEnum as $name) {
            if (isset($data[$name]) && $data[$name]) {
                $method = "set{$name}";
                $socialNetworks->{$method}($data[$name]);
            }
            unset($data[$name]);
        }

        $organization->setOrganizationSocialNetworks($socialNetworks);
    }

    public function isGranted(string $organizationId, ?User $viewer): bool
    {
        if (!$viewer) {
            return false;
        }

        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        if (!$organization) {
            return false;
        }

        return $this->authorizationChecker->isGranted(OrganizationVoter::EDIT, $organization);
    }

    private function updateSlug(Organization $organization, array $translations): void
    {
        foreach ($translations as $translation) {
            if ($translation['title']) {
                $slug = strtolower($this->slugger->slug($translation['title'])->toString());
                $organization->setSlug($slug);

                return;
            }
        }
    }
}
