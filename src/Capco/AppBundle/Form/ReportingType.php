<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Reporting;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ReportingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('status', ChoiceType::class, [
                'required' => true,
                'choices' => array_keys(Reporting::$statusesLabels),
            ])
            ->add('body', TextareaType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }
}
