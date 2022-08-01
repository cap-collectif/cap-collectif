<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\CanSetOwner;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreatePostMutation implements MutationInterface
{
    public const INVALID_FORM = 'INVALID_FORM';
    public const INVALID_OWNER = 'INVALID_OWNER';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private AuthorizationCheckerInterface $authorizationChecker;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->authorizationChecker = $authorizationChecker;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $post = (new Post())->setOwner($this->getOwner($input, $viewer))->setCreator($viewer);

        $data = $input->getArrayCopy();

        if (isset($data['authors'])) {
            $data['Authors'] = $data['authors'];
            unset($data['authors']);
        }
        if (isset($data['owner'])) {
            unset($data['owner']);
        }

        LocaleUtils::indexTranslations($data);

        $form = $this->formFactory->create(PostType::class, $post);
        $form->submit($data, false);

        if (!$form->isValid()) {
            return ['post' => null, 'errorCode' => self::INVALID_FORM];
        }

        if ($viewer->isOnlyProjectAdmin()) {
            $post->setAuthors([$viewer]);
        }

        $this->em->persist($post);
        $this->em->flush();

        return ['post' => $post, 'errorCode' => null];
    }

    public function getOrganization(string $organizationId, User $viewer): Organization
    {
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);
        if (!$organization) {
            throw new UserError('Organization not found');
        }

        return $organization;
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(PostVoter::CREATE, new Post());
    }

    private function getOwner(Argument $input, User $viewer): Owner
    {
        if ($input->offsetGet('owner')) {
            $owner = $this->globalIdResolver->resolve($input->offsetGet('owner'), $viewer);
            if ($owner && CanSetOwner::check($owner, $viewer)) {
                return $owner;
            }

            throw new UserError(self::INVALID_OWNER);
        }

        return $viewer;
    }
}
