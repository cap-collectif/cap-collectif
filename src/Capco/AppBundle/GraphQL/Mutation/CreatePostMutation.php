<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
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
    private SettableOwnerResolver $settableOwnerResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AuthorizationCheckerInterface $authorizationChecker,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->authorizationChecker = $authorizationChecker;
        $this->settableOwnerResolver = $settableOwnerResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $post = (new Post())->setCreator($viewer);
        try {
            $post->setOwner($this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer));
        } catch (UserError $error) {
            throw new UserError(self::INVALID_OWNER);
        }

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

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(PostVoter::CREATE, new Post());
    }
}
