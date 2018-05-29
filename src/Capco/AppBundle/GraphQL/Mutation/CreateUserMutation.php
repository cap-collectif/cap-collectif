<?php

namespace Capco\AppBundle\GraphQL\Mutation;


use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserFormType;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use GraphQL\Language\AST\Argument;
use Monolog\Logger;
use Symfony\Component\Form\FormFactory;

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

    public function __invoke(Argument $input)
    {
        $arguments = $input->getRawArguments();
        $user = (new User())
            ->setUsername($arguments['username'])
            ->setEmail($arguments['email'])
            ->setPlainPassword($arguments['plainPassword'])
            ->setRoles($arguments['roles'])
            ->setLocked($arguments['locked'])
            ->setVip($arguments['vip'])
            ->setEnabled($arguments['enabled']);


        $form = $this->formFactory->create(UserFormType::class, $user, ['csrf_protection' => false]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw new UserError('Invalid data.');
        }

        $this->em->persist($user);
        $this->em->flush();

        return ['user' => $user];
    }
}
