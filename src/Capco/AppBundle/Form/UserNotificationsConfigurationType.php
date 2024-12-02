<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserNotificationsConfigurationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('onProposalCommentMail', CheckboxType::class)
            ->add('consentExternalCommunication', CheckboxType::class)
            ->add('consentInternalCommunication', CheckboxType::class)
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => UserNotificationsConfiguration::class,
            'csrf_protection' => false,
        ]);
    }
}
