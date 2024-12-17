<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserDataFormType;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateUserMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly Manager $toggleManager, private readonly GlobalIdResolver $globalIdResolver)
    {
    }

    /**
     * @return array{'user': User|null, 'validationErrors': non-empty-string|false|null}
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        $user = $this->getUser($arguments);
        $this->handlePhone($arguments, $user);
        $this->handleUserType($arguments);

        $form = $this->formFactory->create(UserDataFormType::class, $user, [
            'csrf_protection' => false,
        ]);

        $form->submit($arguments, false);

        $validationErrors = [];

        if ($form->isSubmitted() && !$form->isValid()) {
            $errors = $form->getErrors(true);
            foreach ($errors as $error) {
                $field = $error->getOrigin()->getName();
                $validationErrors[$field] = $error->getMessageTemplate();
            }
        }

        if (!empty($validationErrors)) {
            return ['user' => null, 'validationErrors' => json_encode($validationErrors)];
        }

        $this->em->flush();

        return ['user' => $user, 'validationErrors' => null];
    }

    /**
     * @param array<mixed> $arguments
     */
    private function getUser(array &$arguments): User
    {
        $userId = $arguments['userId'];
        $user = $this->globalIdResolver->resolve($userId);

        if (!$user instanceof User) {
            throw new UserError('User not found.');
        }

        unset($arguments['userId']);

        return $user;
    }

    /**
     * @param array<mixed> $arguments
     */
    private function handlePhone(array &$arguments, User $user): void
    {
        $oldPhone = $user->getPhone();
        $newPhone = $arguments['phone'] ?? null;

        if (!$newPhone || ($oldPhone !== $newPhone)) {
            $arguments['phoneConfirmed'] = false;
        }
    }

    /**
     * @param array<mixed> $arguments
     */
    private function handleUserType(array &$arguments): void
    {
        $userType = $arguments['user_type'] ?? null;
        $toggleEnabled = $this->toggleManager->isActive(Manager::user_type);
        if ($userType && !$toggleEnabled) {
            throw new UserError('user_type feature is not enabled.');
        }
    }
}
