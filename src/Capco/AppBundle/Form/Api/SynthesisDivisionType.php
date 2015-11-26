<?php

namespace Capco\AppBundle\Form\Api;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class SynthesisDivisionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('elements', 'collection', [
                'type'               => new SynthesisElementType(false),
                'allow_add'          => true,
                'allow_delete'       => true,
                'by_reference'       => false,
                'required'           => false,
                'cascade_validation' => true,
        ]);
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class'      => 'Capco\AppBundle\Entity\Synthesis\SynthesisDivision',
            'csrf_protection' => false,
        ]);
    }

    public function getName()
    {
        return '';
    }
}
