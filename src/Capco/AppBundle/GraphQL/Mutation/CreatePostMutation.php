<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreatePostMutation implements MutationInterface
{
    public const INVALID_FORM = 'INVALID_FORM';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $post = new Post();

        $data = $input->getArrayCopy();
        unset($data['authors']);
        $data['Authors'] = $input->offsetGet('authors');

        $post->setOwner($viewer);

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
