<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\ValueResponseType;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ApiRegistrationFormType extends AbstractType
{
    private $toggleManager;
    private $transformer;

    public function __construct(Manager $toggleManager, $transformer)
    {
        $this->toggleManager = $toggleManager;
        $this->transformer = $transformer;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // disable password repeated
        $builder
            ->remove('plainPassword')
            ->add('plainPassword', PasswordType::class)
        ;

        $builder->add('captcha', ReCaptchaType::class, ['validation_groups' => ['registration']]);

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, ['required' => false]);
        }

        if ($this->toggleManager->isActive('zipcode_at_register')) {
            $builder->add('zipcode', null, ['required' => false]);
        }

        $builder
            ->add('responses', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'type' => new ValueResponseType($this->transformer),
                'required' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'cascade_validation' => true,
            'validation_groups' => ['registration'],
        ]);
    }

    public function getParent()
    {
        return 'sonata_user_registration';
    }
}
