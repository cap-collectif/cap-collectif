<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Reporting;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ReportingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('status', 'choice', [
                'required' => true,
                'choices' => Reporting::$statusesLabels,
            ])
            ->add('body', 'textarea', ['required' => true])
        ;
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }

    public function getName() : string
    {
        return 'reporting_type';
    }
}
