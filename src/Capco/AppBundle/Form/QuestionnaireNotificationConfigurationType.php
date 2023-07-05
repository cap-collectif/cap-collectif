<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionnaireNotificationConfigurationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', EmailType::class)
            ->add('onQuestionnaireReplyCreate', CheckboxType::class)
            ->add('onQuestionnaireReplyUpdate', CheckboxType::class)
            ->add('onQuestionnaireReplyDelete', CheckboxType::class)
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => QuestionnaireNotificationConfiguration::class,
            'csrf_protection' => false,
        ]);
    }
}
