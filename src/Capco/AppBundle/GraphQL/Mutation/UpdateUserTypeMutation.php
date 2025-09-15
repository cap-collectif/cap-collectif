<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\UserTypeType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateUserTypeMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory
    ) {
    }

    /**
     * @return array<string, UserType>
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        $id = $input->offsetGet('id');
        $userType = $this->globalIdResolver->resolve($id, $viewer);
        if (null === $userType) {
            throw new UserError(sprintf('UserType with id: %s not found.', $id));
        }

        $data = $input->getArrayCopy();
        LocaleUtils::indexTranslations($data);
        unset($data['id']);

        $form = $this->formFactory->create(UserTypeType::class, $userType);
        $form->submit($data, false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return ['userType' => $userType];
    }
}
