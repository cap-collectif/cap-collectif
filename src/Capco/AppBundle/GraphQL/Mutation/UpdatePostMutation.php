<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Form\PostType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\PostRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdatePostMutation implements MutationInterface
{

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;

    public const INVALID_FORM = 'INVALID_FORM';
    public const POST_NOT_FOUND = 'POST_NOT_FOUND';

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('id');
        $post = $this->globalIdResolver->resolve($id, $viewer);

        if (!$post) {
            return ['post' => null, 'errorCode' => self::POST_NOT_FOUND];
        }

        return $this->updatePost($post, $input);
    }

    public function updatePost(Post $post, Argument $input): array
    {
        $data = $input->getArrayCopy();
        unset($data['authors'], $data['id']);
        $data['Authors'] = $input->offsetGet('authors');

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
