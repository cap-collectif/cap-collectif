<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\UserTypeType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class CreateUserTypeMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory
    ) {
    }

    /**
     * @return array<string, UserType>
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $userType = new UserType();

        LocaleUtils::indexTranslations($data);

        $form = $this->formFactory->create(UserTypeType::class, $userType);
        $form->submit($data, false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($userType);
        $this->em->flush();

        return ['userType' => $userType];
    }
}
