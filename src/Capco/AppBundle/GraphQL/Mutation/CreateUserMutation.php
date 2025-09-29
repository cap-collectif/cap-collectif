<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserFormType;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CreateUserMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private EntityManagerInterface $em,
        private FormFactoryInterface $formFactory,
        private LoggerInterface $logger
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $user = new User();
        if (isset($arguments['roles']['ROLE_ADMIN'])) {
            $user->setSubscribedToActualitiesPosted(true);
        }

        $form = $this->formFactory->create(UserFormType::class, $user, [
            'csrf_protection' => false,
        ]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($user);
            $this->em->flush();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        return ['user' => $user];
    }
}
