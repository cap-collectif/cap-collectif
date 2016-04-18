<?php

namespace Capco\AppBundle\Twig;

use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;

class UserTypeExtension extends \Twig_Extension
{
    protected $repo;

    public function __construct(UserTypeRepository $repo)
    {
        $this->repo = $repo;
    }

    public function getName()
    {
        return 'user_type';
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('user_type_list', [$this, 'getUserTypes']),
        ];
    }

    public function getUserTypes()
    {
        return $this->repo->findAllToArray();
    }
}
