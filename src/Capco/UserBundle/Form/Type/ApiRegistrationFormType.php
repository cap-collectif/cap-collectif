<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\SiteParameter\Resolver as SiteParameterResolver;

class ApiRegistrationFormType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, ['required' => false]);
        }

        if ($this->toggleManager->isActive('zipcode_at_register')) {
            $builder->add('zipcode', null, ['required' => false]);
        }
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        // registration group is set by sonata
    }

    public function getParent()
    {
        return 'sonata_user_registration';
    }

    public function getName()
    {
        return 'capco_user_registration';
    }
}
