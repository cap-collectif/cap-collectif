<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ReportingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('status',
                ChoiceType::class, [
                'required' => true,
                'choices' => array_keys(Reporting::$statusesLabels),
            ])
            ->add('body', PurifiedTextareaType::class, ['required' => true])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }
}
