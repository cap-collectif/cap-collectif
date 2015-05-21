<?php

namespace Capco\AppBundle\Form\Api;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class SynthesisElementType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, ['required' => true])
            ->add('body', null, ['required' => false])
            ->add('status', null, ['required' => true])
            ->add('notation', null, ['required' => false])
        ;
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Synthesis\SynthesisElement',
            'csrf_protection' => false,
        ]);
    }

    public function getName()
    {
        return 'capco_api_synthesis_element';
    }

}
