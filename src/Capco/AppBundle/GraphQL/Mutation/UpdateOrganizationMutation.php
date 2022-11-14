<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationSocialNetworks;
use Capco\AppBundle\Form\OrganizationType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\OrganizationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateOrganizationMutation implements MutationInterface
{
    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $organizationId = $input->offsetGet('organizationId');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        if (!$organization) {
            return ['organization' => null, 'errorCode' => self::ORGANIZATION_NOT_FOUND];
        }

        $data = $input->getArrayCopy();
        unset($data['organizationId']);

        LocaleUtils::indexTranslations($data);
        $this->handleSocialNetworks($organization, $data);

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
}