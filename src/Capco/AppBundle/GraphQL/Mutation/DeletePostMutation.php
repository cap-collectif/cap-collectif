<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class DeletePostMutation implements MutationInterface
{
    public const POST_NOT_FOUND = 'POST_NOT_FOUND';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;

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
            return ['errorCode' => self::POST_NOT_FOUND];
        }

        $this->em->remove($post);
        $this->em->flush();

        return ['errorCode' => null];
    }
}
