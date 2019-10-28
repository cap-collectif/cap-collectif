<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\DBAL\Enum\EventReviewRefusedReasonType;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class EventReviewType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('reviewer')
            ->add('comment', TextType::class)
            ->add('refusedReason', ChoiceType::class, [
                'choices' => EventReviewRefusedReasonType::$refusedReasons
            ])
            ->add('status', ChoiceType::class, [
                'choices' => EventReviewStatusType::$eventReviewStatus
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => EventReview::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle'
        ]);
    }
}
