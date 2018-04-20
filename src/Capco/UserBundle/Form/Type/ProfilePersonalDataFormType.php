<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Model\UserInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\BirthdayType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProfilePersonalDataFormType extends AbstractType
{
    private $class;

    public function __construct(String $class)
    {
        $this->class = $class;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('address', null, [
                'label' => 'user.profile.edit.address',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('address2', null, [
                'label' => 'user.profile.edit.address2',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('zipCode', null, [
                'label' => 'user.profile.edit.zip_code',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('city', null, [
                'label' => 'user.profile.edit.city',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('gender', 'sonata_user_gender', [
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('dateOfBirth',
                BirthdayType::class, [
                    'required' => false,
                    'label' => 'user.profile.edit.birthday',
                    'translation_domain' => 'CapcoAppBundle',
                ])
            ->add('gender', 'sonata_user_gender', array(
                'label'              => 'form.label_gender',
                'required'           => false,
                'translation_domain' => 'SonataUserBundle',
                'choices'            => array(
                    UserInterface::GENDER_FEMALE => 'gender_female',
                    UserInterface::GENDER_MALE   => 'gender_male',
                    User::GENDER_OTHER   => 'gender_other',
                ),
            ))
        ;

    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => $this->class,
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'capco_user_personal_data';
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return $this->getBlockPrefix();
    }
}
