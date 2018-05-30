<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserFormType;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\ORMException;
use GraphQL\Error\UserError;
use Monolog\Logger;
use Symfony\Component\Form\FormFactory;
use Overblog\GraphQLBundle\Definition\Argument;

class CreateUserMutation
{
    private $em;
    private $formFactory;
    private $logger;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, Logger $logger)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $user = (new User())
            ->setUsername($arguments['username'])
            ->setEmail($arguments['email'])
            ->setPlainPassword(isset($arguments['plainPassword']) ? $arguments['plainPassword'] : '')
            ->setRoles($arguments['roles'])
            ->setLocked(isset($arguments['locked']) ? $arguments['locked'] : false)
            ->setVip(isset($arguments['vip']) ? $arguments['vip'] : false)
            ->setEnabled(isset($arguments['enabled']) ? $arguments['enabled'] : false);

        $form = $this->formFactory->create(UserFormType::class, $user, ['csrf_protection' => false]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw new UserError('Invalid data.');
        }

        try {
            $this->em->persist($user);
            $this->em->flush();
        } catch (\Exception $e) {
            dump($e);die;
        }

        return ['user' => $user];
    }
}
