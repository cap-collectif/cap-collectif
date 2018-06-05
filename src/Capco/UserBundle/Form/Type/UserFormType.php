<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserFormType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $builder
            ->add('username', null, [
                'required' => true,
            ])
            ->add('email', null, [
                'required' => true,
            ])
            ->add('plainPassword')
            ->add('locked')
            ->add('vip')
            ->add('enabled')
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(
            [
                'data_class' => User::class,
            ]
        );
    }
}