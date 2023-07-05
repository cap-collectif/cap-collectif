<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Form\Step\AbstractStepFormType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SmsCreditType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('amount', IntegerType::class)
            ->add('smsOrder', RelayNodeType::class, [
                'class' => SmsOrder::class,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => SmsCredit::class,
        ]);
    }
}
