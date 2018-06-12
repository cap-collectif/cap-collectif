<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

abstract class BaseUpdateProfile
{
    protected $em;
    protected $formFactory;
    protected $logger;
    protected $user;
    protected $arguments;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user)
    {
        $this->arguments = $input->getRawArguments();

        if (!$user->hasRole('ROLE_SUPER_ADMIN') && !empty($this->arguments['userId'])) {
            throw new UserError('Your are not allowed');
        }
        $this->user = $user;
        if ($user->hasRole('ROLE_SUPER_ADMIN') && !empty($this->arguments['userId'])
            && $user->getId() !== $this->arguments['userId']) {
            $this->user = $this->em->getRepository('CapcoUserBundle:User')->find($this->arguments['userId']);
        }

        if (isset($this->arguments['userId'])) {
            unset($this->arguments['userId']);
        }
    }
}
