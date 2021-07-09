<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;

class CreatePostMutation implements MutationInterface
{
    public const INVALID_FORM = 'INVALID_FORM';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;

    public function __construct(EntityManagerInterface $em, FormFactoryInterface $formFactory)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $post = new Post();

        return $this->createPost($post, $input, $viewer);
    }

    public function createPost(Post $post, Argument $input, User $viewer): array
    {
        $data = $input->getArrayCopy();
        unset($data['authors']);
        $data['Authors'] = $input->offsetGet('authors');

        if ($viewer->hasRole('ROLE_PROJECT_ADMIN') && !$viewer->hasRole('ROLE_ADMIN')) {
            $viewerGlobalId = GlobalId::toGlobalId('User', $viewer->getId());
            $data['Authors'] = [$viewerGlobalId];
        }

        LocaleUtils::indexTranslations($data);

        $form = $this->formFactory->create(PostType::class, $post);
        $form->submit($data, false);

        if (!$form->isValid()) {
            return ['post' => null, 'errorCode' => self::INVALID_FORM];
        }

        $this->em->persist($post);
        $this->em->flush();

        return ['post' => $post, 'errorCode' => null];
    }
}
