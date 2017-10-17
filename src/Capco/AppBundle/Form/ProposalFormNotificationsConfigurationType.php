<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalFormNotificationsConfigurationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('onCreate', CheckboxType::class, ['required' => false])
            ->add('onUpdate', CheckboxType::class, ['required' => false])
            ->add('onDelete', CheckboxType::class, ['required' => false])
            ->add('onCommentCreate', CheckboxType::class, ['required' => false])
            ->add('onCommentUpdate', CheckboxType::class, ['required' => false])
            ->add('onCommentDelete', CheckboxType::class, ['required' => false])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ProposalFormNotificationConfiguration::class,
            'csrf_protection' => false,
        ]);
    }
}
